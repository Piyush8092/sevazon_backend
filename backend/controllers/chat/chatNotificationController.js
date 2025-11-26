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

        console.log('📨 Chat notification request received');
        console.log('   Recipient ID:', recipientId);
        console.log('   Sender Name:', senderName);
        console.log('   Message Text:', messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''));
        console.log('   Conversation ID:', conversationId);
        console.log('   Message ID:', messageId);

        // Validate required fields
        if (!recipientId || !senderName || !messageText || !conversationId) {
            console.error('❌ Missing required fields for chat notification');
            return res.status(400).json({
                message: 'recipientId, senderName, messageText, and conversationId are required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Get sender ID from authenticated user
        const senderId = req.user._id;
        console.log('   Sender ID:', senderId);

        // Don't send notification to self
        if (recipientId.toString() === senderId.toString()) {
            console.log('⚠️ Not sending notification to self');
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
            console.error('❌ Recipient not found:', recipientId);
            return res.status(404).json({
                message: 'Recipient not found',
                status: 404,
                success: false,
                error: true
            });
        }
        console.log('✅ Recipient found:', recipient.name);

        // Check if recipient has muted this conversation
        const preferences = await NotificationPreferences.findOne({ userId: recipientId });
        if (preferences && preferences.isConversationMuted(conversationId)) {
            console.log('🔇 Conversation muted for recipient');
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

        console.log('📤 Sending notification via notificationService.sendToUser');
        console.log('   Title:', title);
        console.log('   Body:', body);
        console.log('   Data:', JSON.stringify(data));

        // Send notification using the notification service
        const result = await notificationService.sendToUser(
            recipientId,
            title,
            body,
            data,
            options
        );

        console.log('📬 Notification service result:', JSON.stringify(result));

        if (result.success) {
            console.log('✅ Chat notification sent successfully');
            console.log('   Tokens notified:', result.totalTokens || 0);
            console.log('   Success count:', result.successCount || 0);
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
            console.log('⚠️ Notification not sent');
            console.log('   Reason:', result.reason || 'unknown');
            console.log('   Error:', result.error || 'none');
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
        console.error('❌ Error sending chat notification:', error);
        console.error('   Stack trace:', error.stack);
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

