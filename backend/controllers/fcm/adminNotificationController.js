const notificationService = require("../../services/notificationService");
const NotificationHistory = require("../../model/notificationHistoryModel");
const FCMToken = require("../../model/fcmTokenModel");
const User = require("../../model/userModel");

// Admin middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Access denied. Admin role required",
      status: 403,
      success: false,
      error: true,
    });
  }
  next();
};

// Send manual notification to specific user
const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title, body, data = {}, options = {} } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        message: "userId, title, and body are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    const notificationOptions = {
      category: "system",
      type: "admin_message",
      priority: "normal",
      senderId: req.user._id,
      ...options,
    };

    const result = await notificationService.sendToUser(
      userId,
      title,
      body,
      data,
      notificationOptions
    );

    res.json({
      message: "Notification sent successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error sending manual notification:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Send notification to multiple users
const sendNotificationToMultipleUsers = async (req, res) => {
  try {
    const { userIds, title, body, data = {}, options = {} } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "userIds array is required and cannot be empty",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        message: "title and body are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    if (userIds.length > 1000) {
      return res.status(400).json({
        message: "Cannot send to more than 1000 users at once",
        status: 400,
        success: false,
        error: true,
      });
    }

    const notificationOptions = {
      category: "system",
      type: "admin_broadcast",
      priority: "normal",
      senderId: req.user._id,
      ...options,
    };

    const result = await notificationService.sendToMultipleUsers(
      userIds,
      title,
      body,
      data,
      notificationOptions
    );

    res.json({
      message: "Notifications sent successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error sending notifications to multiple users:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Send broadcast notification to all users
const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, body, data = {}, options = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        message: "title and body are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    const notificationOptions = {
      category: "system",
      type: "admin_broadcast",
      priority: "normal",
      senderId: req.user._id,
      ...options,
    };

    const result = await notificationService.sendBroadcast(title, body, data, notificationOptions);

    res.json({
      message: "Broadcast notification sent successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get notification system statistics
const getNotificationStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Overall delivery statistics
    const overallStats = await NotificationHistory.getDeliveryStats({
      createdAt: { $gte: startDate },
    });

    // Category breakdown
    const categoryStats = await NotificationHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          opened: { $sum: { $cond: ["$userInteraction.opened", 1, 0] } },
        },
      },
    ]);

    // Daily notification volume
    const dailyVolume = await NotificationHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    // Active tokens count
    const activeTokensCount = await FCMToken.countDocuments({ isActive: true });
    const totalUsersWithTokens = await FCMToken.distinct("userId", { isActive: true });

    res.json({
      message: "Notification statistics retrieved successfully",
      status: 200,
      data: {
        overall: overallStats[0] || {},
        categoryBreakdown: categoryStats,
        dailyVolume,
        activeTokensCount,
        usersWithTokensCount: totalUsersWithTokens.length,
        period: `Last ${days} days`,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving notification statistics:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get failed notifications for troubleshooting
const getFailedNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const failedNotifications = await NotificationHistory.find({
      status: "failed",
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email phone")
      .populate("senderId", "name email")
      .lean();

    const totalCount = await NotificationHistory.countDocuments({
      status: "failed",
      createdAt: { $gte: startDate },
    });

    res.json({
      message: "Failed notifications retrieved successfully",
      status: 200,
      data: {
        notifications: failedNotifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
        },
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving failed notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Clean up old notifications and tokens
const cleanupOldData = async (req, res) => {
  try {
    const { notificationDays = 90, tokenDays = 30 } = req.body;

    // Clean up old notifications
    const notificationCleanup = await NotificationHistory.cleanupOldNotifications(
      parseInt(notificationDays)
    );

    // Clean up old inactive tokens
    const tokenCleanup = await FCMToken.cleanupOldTokens(parseInt(tokenDays));

    res.json({
      message: "Cleanup completed successfully",
      status: 200,
      data: {
        notificationsDeleted: notificationCleanup.deletedCount,
        tokensDeleted: tokenCleanup.deletedCount,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error during cleanup:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get poor performing tokens for analysis
const getPoorPerformingTokens = async (req, res) => {
  try {
    const { threshold = 0.8, limit = 100 } = req.query;

    const poorTokens = await FCMToken.findPoorPerformingTokens(parseFloat(threshold));

    const limitedResults = poorTokens.slice(0, parseInt(limit));

    res.json({
      message: "Poor performing tokens retrieved successfully",
      status: 200,
      data: {
        tokens: limitedResults,
        totalCount: poorTokens.length,
        threshold: parseFloat(threshold),
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving poor performing tokens:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = {
  requireAdmin,
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
  sendBroadcastNotification,
  getNotificationStats,
  getFailedNotifications,
  cleanupOldData,
  getPoorPerformingTokens,
};
