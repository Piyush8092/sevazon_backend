const notificationService = require('../../services/notificationService');
const notificationTriggers = require('../../services/notificationTriggers');
const User = require('../../model/userModel');
const NotificationPreferences = require('../../model/notificationPreferencesModel');

/**
 * Send notification when a new chat message is sent
 * POST /api/chat/send-message-notification
 */
const sendMessageNotification = async (req, res) => {
    try {
        const {
            recipientId,
            senderName,
            messageText,
            conversationId,
            messageId
        } = req.body;

        // Validate required fields
        if (!recipientId || !senderName || !messageText || !conversationId) {
            return res.status(400).json({
                message: 'recipientId, senderName, messageText, and conversationId are required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Get sender ID from authenticated user
        const senderId = req.user._id;

        // Don't send notification to self
        if (recipientId.toString() === senderId.toString()) {
            return res.json({
                message: 'Notification not sent (sender is recipient)',
                status: 200,
                success: true,
                error: false,
                data: { reason: 'self_message' }
            });
        }

        // Verify recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                message: 'Recipient not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Check if recipient has muted this conversation
        const preferences = await NotificationPreferences.findOne({ userId: recipientId });
        if (preferences && preferences.isConversationMuted(conversationId)) {
            return res.json({
                message: 'Notification not sent (conversation muted)',
                status: 200,
                success: true,
                error: false,
                data: { reason: 'conversation_muted' }
            });
        }

        // Prepare notification data
        const title = senderName;
        const body = messageText.length > 100 
            ? messageText.substring(0, 100) + '...' 
            : messageText;

        const data = {
            type: 'message',
            conversationId,
            senderId: senderId.toString(),
            senderName,
            messageId: messageId || '',
            timestamp: new Date().toISOString()
        };

        const options = {
            category: 'chat',
            type: 'newMessage',
            priority: 'high',
            senderId,
            relatedEntity: {
                entityType: 'chat',
                entityId: conversationId
            },
            android: {
                priority: 'high',
                notification: {
                    sound: 'message_tone',
                    channelId: 'chat_messages'
                }
            },
            ios: {
                sound: 'message_tone.wav',
                badge: 1
            }
        };

        // Send notification using the notification service
        const result = await notificationService.sendToUser(
            recipientId,
            title,
            body,
            data,
            options
        );

        if (result.success) {
            return res.json({
                message: 'Chat notification sent successfully',
                status: 200,
                success: true,
                error: false,
                data: {
                    notificationSent: true,
                    tokensNotified: result.totalTokens || 0,
                    successCount: result.successCount || 0
                }
            });
        } else {
            return res.json({
                message: 'Notification not sent',
                status: 200,
                success: true,
                error: false,
                data: {
                    notificationSent: false,
                    reason: result.reason || 'unknown',
                    error: result.error
                }
            });
        }

    } catch (error) {
        console.error('Error sending chat notification:', error);
        return res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = {
    sendMessageNotification
};

