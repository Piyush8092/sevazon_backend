const router = require('express').Router();
const authGuard = require('../middleware/auth');
const chatNotificationController = require('../controllers/chat/chatNotificationController');

// Import rate limiting middleware
const { fcmRateLimit, spamPrevention, notificationSpamDetection } = require('../middleware/rateLimiter');

// ============================================================================
// CHAT NOTIFICATION ROUTES
// ============================================================================

/**
 * Send notification for new chat message
 * POST /api/chat/send-message-notification
 * 
 * Request body:
 * {
 *   "recipientId": "user_id",
 *   "senderName": "John Doe",
 *   "messageText": "Hello, how are you?",
 *   "conversationId": "conversation_id",
 *   "messageId": "message_id" (optional)
 * }
 */
router.post('/send-message-notification',
    authGuard,
    fcmRateLimit,
    spamPrevention,
    notificationSpamDetection,
    chatNotificationController.sendMessageNotification
);

module.exports = router;

