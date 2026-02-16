const router = require('express').Router();
const authGuard = require('../middleware/auth');
const chatNotificationController = require('../controllers/chat/chatNotificationController');

const chatController = require('../controllers/chat/chatController');

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

// Create or get a chat room
router.post('/room', authGuard, chatController.createOrGetRoom);

// Send a message
router.post('/message', authGuard, chatController.sendMessage);

// Get messages for a room (paginated)
router.get('/messages/:roomId', authGuard, chatController.getMessages);

// Get all rooms for the user
router.get('/rooms', authGuard, chatController.getRooms);

module.exports = router;

