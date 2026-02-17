const router = require('express').Router();
const authGuard = require('../middleware/auth');

const chatNotificationController = require('../controllers/chat/chatNotificationController');
const chatController = require('../controllers/chat/chatController');
const checkSubscription = require('../middleware/checkSubscription');

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

// =============================
// CHAT MESSAGE/ROOM ROUTES
// =============================


// Create or get a chat room (protected)
router.post('/room', authGuard, checkSubscription, chatController.createOrGetRoom);

// Send a message (protected)
router.post('/message', authGuard, checkSubscription, chatController.sendMessage);

// Get messages for a room (protected)
router.get('/messages/:roomId', authGuard, checkSubscription, chatController.getMessages);

// Get all rooms for the user (protected)
router.get('/rooms', authGuard, checkSubscription, chatController.getRooms);

module.exports = router;

