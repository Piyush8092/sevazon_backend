const router = require('express').Router();
const authGuard = require('../middleware/auth');

// Import controllers
const fcmTokenController = require('../controllers/fcm/fcmTokenController');
const notificationPreferencesController = require('../controllers/fcm/notificationPreferencesController');
const notificationHistoryController = require('../controllers/fcm/notificationHistoryController');
const adminNotificationController = require('../controllers/fcm/adminNotificationController');
const notificationSchedulerController = require('../controllers/fcm/notificationSchedulerController');

// Import middleware
const {
    fcmRateLimit,
    tokenRegistrationLimit,
    manualNotificationLimit,
    preferencesUpdateLimit,
    historyQueryLimit,
    spamPrevention,
    notificationSpamDetection,
    duplicateNotificationPrevention
} = require('../middleware/rateLimiter');

// Apply general FCM rate limiting to all routes
router.use(fcmRateLimit);

// ============================================================================
// FCM TOKEN MANAGEMENT ROUTES
// ============================================================================

// Register or update FCM token
router.post('/token', 
    authGuard, 
    tokenRegistrationLimit, 
    spamPrevention,
    fcmTokenController.registerToken
);

// Remove FCM token (logout)
router.delete('/token', 
    authGuard, 
    fcmTokenController.removeToken
);

// Get user's active FCM tokens
router.get('/tokens', 
    authGuard, 
    fcmTokenController.getUserTokens
);

// Validate FCM token
router.post('/token/validate', 
    authGuard, 
    fcmTokenController.validateToken
);

// ============================================================================
// NOTIFICATION PREFERENCES ROUTES
// ============================================================================

// Get user's notification preferences
router.get('/preferences', 
    authGuard, 
    notificationPreferencesController.getPreferences
);

// Update user's notification preferences
router.put('/preferences', 
    authGuard, 
    preferencesUpdateLimit,
    notificationPreferencesController.updatePreferences
);

// Reset preferences to default
router.post('/preferences/reset', 
    authGuard, 
    notificationPreferencesController.resetPreferences
);

// Get specific category preferences
router.get('/preferences/:category', 
    authGuard, 
    notificationPreferencesController.getCategoryPreferences
);

// Update specific category preferences
router.put('/preferences/:category', 
    authGuard, 
    preferencesUpdateLimit,
    notificationPreferencesController.updateCategoryPreferences
);

// Toggle global notifications
router.post('/preferences/global/toggle', 
    authGuard, 
    notificationPreferencesController.toggleGlobalNotifications
);

// Update quiet hours
router.put('/preferences/quiet-hours', 
    authGuard, 
    notificationPreferencesController.updateQuietHours
);

// ============================================================================
// NOTIFICATION HISTORY ROUTES
// ============================================================================

// Get user's notification history
router.get('/history', 
    authGuard, 
    historyQueryLimit,
    notificationHistoryController.getUserNotificationHistory
);

// Mark notification as opened
router.post('/history/:notificationId/opened', 
    authGuard, 
    notificationHistoryController.markNotificationAsOpened
);

// Mark notification as clicked
router.post('/history/:notificationId/clicked', 
    authGuard, 
    notificationHistoryController.markNotificationAsClicked
);

// Get user's notification statistics
router.get('/history/stats', 
    authGuard, 
    notificationHistoryController.getUserNotificationStats
);

// Get unread notification count
router.get('/history/unread-count', 
    authGuard, 
    notificationHistoryController.getUnreadCount
);

// Mark all notifications as read
router.post('/history/mark-all-read', 
    authGuard, 
    notificationHistoryController.markAllAsRead
);

// Delete notification
router.delete('/history/:notificationId', 
    authGuard, 
    notificationHistoryController.deleteNotification
);

// ============================================================================
// NOTIFICATION SCHEDULING ROUTES
// ============================================================================

// Schedule a notification
router.post('/schedule', 
    authGuard, 
    spamPrevention,
    notificationSpamDetection,
    duplicateNotificationPrevention,
    notificationSchedulerController.scheduleNotification
);

// Get scheduled notifications
router.get('/schedule', 
    authGuard, 
    notificationSchedulerController.getScheduledNotifications
);

// Cancel scheduled notification
router.delete('/schedule/:notificationId', 
    authGuard, 
    notificationSchedulerController.cancelScheduledNotification
);

// Update scheduled notification
router.put('/schedule/:notificationId', 
    authGuard, 
    spamPrevention,
    notificationSpamDetection,
    notificationSchedulerController.updateScheduledNotification
);

// Get scheduling statistics
router.get('/schedule/stats', 
    authGuard, 
    notificationSchedulerController.getSchedulingStats
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Send notification to specific user (admin only)
router.post('/admin/send-to-user', 
    authGuard, 
    adminNotificationController.requireAdmin,
    manualNotificationLimit,
    spamPrevention,
    notificationSpamDetection,
    duplicateNotificationPrevention,
    adminNotificationController.sendNotificationToUser
);

// Send notification to multiple users (admin only)
router.post('/admin/send-to-users', 
    authGuard, 
    adminNotificationController.requireAdmin,
    manualNotificationLimit,
    spamPrevention,
    notificationSpamDetection,
    adminNotificationController.sendNotificationToMultipleUsers
);

// Send broadcast notification (admin only)
router.post('/admin/broadcast', 
    authGuard, 
    adminNotificationController.requireAdmin,
    manualNotificationLimit,
    spamPrevention,
    notificationSpamDetection,
    duplicateNotificationPrevention,
    adminNotificationController.sendBroadcastNotification
);

// Get notification system statistics (admin only)
router.get('/admin/stats', 
    authGuard, 
    adminNotificationController.requireAdmin,
    adminNotificationController.getNotificationStats
);

// Get failed notifications (admin only)
router.get('/admin/failed', 
    authGuard, 
    adminNotificationController.requireAdmin,
    adminNotificationController.getFailedNotifications
);

// Clean up old data (admin only)
router.post('/admin/cleanup', 
    authGuard, 
    adminNotificationController.requireAdmin,
    adminNotificationController.cleanupOldData
);

// Get poor performing tokens (admin only)
router.get('/admin/poor-tokens', 
    authGuard, 
    adminNotificationController.requireAdmin,
    adminNotificationController.getPoorPerformingTokens
);

// Process scheduled notifications (admin/cron only)
router.post('/admin/process-scheduled', 
    authGuard, 
    adminNotificationController.requireAdmin,
    notificationSchedulerController.processScheduledNotifications
);

// Cleanup old tokens (admin only)
router.post('/admin/cleanup-tokens', 
    authGuard, 
    adminNotificationController.requireAdmin,
    fcmTokenController.cleanupTokens
);

module.exports = router;
