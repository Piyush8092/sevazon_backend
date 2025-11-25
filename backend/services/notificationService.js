const { getMessaging } = require('../config/firebase');
const FCMToken = require('../model/fcmTokenModel');
const NotificationHistory = require('../model/notificationHistoryModel');
const NotificationPreferences = require('../model/notificationPreferencesModel');
const crypto = require('crypto');

// Helper function to generate UUID v4
const uuidv4 = () => {
    return crypto.randomUUID();
};

class NotificationService {
    constructor() {
        this.messaging = null;
        this.initializeMessaging();
    }

    async initializeMessaging() {
        try {
            this.messaging = getMessaging();
        } catch (error) {
            console.error('Failed to initialize FCM messaging:', error);
        }
    }

    // Create notification payload
    createNotificationPayload(title, body, data = {}, options = {}) {
        const payload = {
            notification: {
                title,
                body
            },
            data: {
                ...data,
                timestamp: Date.now().toString()
            }
        };

        // Add Android-specific options
        if (options.android) {
            payload.android = {
                priority: options.android.priority || options.priority || 'high',
                ...(options.android.notification && {
                    notification: {
                        sound: options.android.notification.sound || options.sound || 'default',
                        channelId: options.android.notification.channelId || options.channelId || 'default',
                        ...options.android.notification
                    }
                })
            };
        }

        // Add iOS-specific options
        if (options.ios) {
            payload.apns = {
                payload: {
                    aps: {
                        sound: options.sound || 'default',
                        badge: options.badge,
                        ...options.ios
                    }
                }
            };
        }

        // Add web-specific options
        if (options.web) {
            payload.webpush = {
                notification: {
                    icon: options.icon,
                    badge: options.badge,
                    ...options.web
                }
            };
        }

        return payload;
    }

    // Send notification to a single user
    async sendToUser(userId, title, body, data = {}, options = {}) {
        try {
            // Validate userId
            if (!userId || userId === 'unknown') {
                console.error(`Invalid userId provided to sendToUser: ${userId}`);
                return { success: false, reason: 'invalid_user_id', error: 'Invalid or missing userId' };
            }

            // Check user preferences
            const preferences = await NotificationPreferences.findOrCreateForUser(userId);
            const category = options.category || 'system';
            const type = options.type || 'general';

            if (!preferences.shouldSendNotification(category, type)) {
                console.log(`Notification blocked by user preferences: ${userId}, ${category}, ${type}`);
                return { success: false, reason: 'blocked_by_preferences' };
            }

            // Get user's active FCM tokens
            const tokens = await FCMToken.findActiveTokensForUser(userId);

            if (tokens.length === 0) {
                console.log(`No active FCM tokens found for user: ${userId}`);
                return { success: false, reason: 'no_tokens' };
            }

            const results = [];
            const batchId = uuidv4();

            for (const tokenDoc of tokens) {
                const result = await this.sendToToken(
                    tokenDoc.token,
                    title,
                    body,
                    data,
                    {
                        ...options,
                        userId,
                        fcmTokenId: tokenDoc._id,
                        batchId
                    }
                );
                results.push(result);
            }

            return {
                success: true,
                results,
                totalTokens: tokens.length,
                successCount: results.filter(r => r.success).length
            };

        } catch (error) {
            console.error('Error sending notification to user:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to a specific FCM token
    async sendToToken(token, title, body, data = {}, options = {}) {
        try {
            if (!this.messaging) {
                await this.initializeMessaging();
            }

            const payload = this.createNotificationPayload(title, body, data, options);
            payload.token = token;

            // Create notification history record
            const historyRecord = new NotificationHistory({
                userId: options.userId,
                fcmTokenId: options.fcmTokenId,
                title,
                body,
                data,
                category: options.category || 'system',
                type: options.type || 'general',
                priority: options.priority || 'normal',
                batchId: options.batchId,
                relatedEntity: options.relatedEntity,
                senderId: options.senderId,
                scheduledAt: new Date()
            });

            await historyRecord.save();

            // Send notification
            const response = await this.messaging.send(payload);

            // Update history record with success
            await historyRecord.markAsSent({
                messageId: response,
                success: true
            });

            // Update token delivery stats
            if (options.fcmTokenId) {
                const tokenDoc = await FCMToken.findById(options.fcmTokenId);
                if (tokenDoc) {
                    await tokenDoc.updateDeliveryStats(true);
                }
            }

            return {
                success: true,
                messageId: response,
                historyId: historyRecord._id
            };

        } catch (error) {
            console.error('Error sending notification to token:', error);

            // Update history record with failure
            if (options.fcmTokenId) {
                try {
                    const historyRecord = await NotificationHistory.findOne({
                        fcmTokenId: options.fcmTokenId,
                        status: 'pending'
                    }).sort({ createdAt: -1 });

                    if (historyRecord) {
                        await historyRecord.markAsFailed(error);
                    }

                    // Update token delivery stats
                    const tokenDoc = await FCMToken.findById(options.fcmTokenId);
                    if (tokenDoc) {
                        await tokenDoc.updateDeliveryStats(false);
                    }

                    // Handle invalid token errors
                    if (this.isInvalidTokenError(error)) {
                        await tokenDoc.deactivate();
                        console.log(`Deactivated invalid FCM token: ${token}`);
                    }
                } catch (updateError) {
                    console.error('Error updating failure record:', updateError);
                }
            }

            return {
                success: false,
                error: error.message,
                code: error.code
            };
        }
    }

    // Send notification to multiple users
    async sendToMultipleUsers(userIds, title, body, data = {}, options = {}) {
        try {
            const results = [];
            const batchId = uuidv4();

            for (const userId of userIds) {
                const result = await this.sendToUser(
                    userId,
                    title,
                    body,
                    data,
                    { ...options, batchId }
                );
                results.push({ userId, ...result });
            }

            return {
                success: true,
                batchId,
                results,
                totalUsers: userIds.length,
                successCount: results.filter(r => r.success).length
            };

        } catch (error) {
            console.error('Error sending notifications to multiple users:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to all users with specific criteria
    async sendBroadcast(title, body, data = {}, options = {}) {
        try {
            // This is a simplified version - in production, you'd want to implement
            // this with a queue system for better performance
            const activeTokens = await FCMToken.find({ isActive: true }).populate('userId');
            
            const userIds = [...new Set(activeTokens.map(token => token.userId._id.toString()))];
            
            return await this.sendToMultipleUsers(userIds, title, body, data, options);

        } catch (error) {
            console.error('Error sending broadcast notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Check if error indicates invalid token
    isInvalidTokenError(error) {
        const invalidTokenCodes = [
            'messaging/invalid-registration-token',
            'messaging/registration-token-not-registered'
        ];
        return invalidTokenCodes.includes(error.code);
    }

    // Schedule notification for later delivery
    async scheduleNotification(userId, title, body, data = {}, scheduledAt, options = {}) {
        try {
            const historyRecord = new NotificationHistory({
                userId,
                title,
                body,
                data,
                category: options.category || 'system',
                type: options.type || 'general',
                priority: options.priority || 'normal',
                scheduledAt: new Date(scheduledAt),
                relatedEntity: options.relatedEntity,
                senderId: options.senderId,
                status: 'pending'
            });

            await historyRecord.save();

            return {
                success: true,
                notificationId: historyRecord._id,
                scheduledAt: historyRecord.scheduledAt
            };

        } catch (error) {
            console.error('Error scheduling notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Process scheduled notifications (to be called by a cron job)
    async processScheduledNotifications() {
        try {
            const now = new Date();
            const scheduledNotifications = await NotificationHistory.find({
                status: 'pending',
                scheduledAt: { $lte: now }
            });

            const results = [];

            for (const notification of scheduledNotifications) {
                const result = await this.sendToUser(
                    notification.userId,
                    notification.title,
                    notification.body,
                    notification.data,
                    {
                        category: notification.category,
                        type: notification.type,
                        priority: notification.priority,
                        relatedEntity: notification.relatedEntity,
                        senderId: notification.senderId
                    }
                );

                results.push({
                    notificationId: notification._id,
                    ...result
                });
            }

            return {
                success: true,
                processedCount: results.length,
                results
            };

        } catch (error) {
            console.error('Error processing scheduled notifications:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new NotificationService();
