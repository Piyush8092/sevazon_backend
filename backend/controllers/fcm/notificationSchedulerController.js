const notificationService = require("../../services/notificationService");
const NotificationHistory = require("../../model/notificationHistoryModel");

// Schedule a notification for later delivery
const scheduleNotification = async (req, res) => {
  try {
    const { userId, title, body, data = {}, scheduledAt, options = {} } = req.body;

    if (!userId || !title || !body || !scheduledAt) {
      return res.status(400).json({
        message: "userId, title, body, and scheduledAt are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Validate scheduledAt is in the future
    const scheduledDate = new Date(scheduledAt);
    const now = new Date();

    if (scheduledDate <= now) {
      return res.status(400).json({
        message: "scheduledAt must be in the future",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Don't allow scheduling more than 30 days in advance
    const maxFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (scheduledDate > maxFutureDate) {
      return res.status(400).json({
        message: "Cannot schedule notifications more than 30 days in advance",
        status: 400,
        success: false,
        error: true,
      });
    }

    const notificationOptions = {
      category: options.category || "system",
      type: options.type || "scheduled",
      priority: options.priority || "normal",
      senderId: req.user._id,
      ...options,
    };

    const result = await notificationService.scheduleNotification(
      userId,
      title,
      body,
      data,
      scheduledAt,
      notificationOptions
    );

    res.json({
      message: "Notification scheduled successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error scheduling notification:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get scheduled notifications
const getScheduledNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = "pending", userId } = req.query;

    const query = { status };

    // If not admin, only show user's own scheduled notifications
    if (req.user.role !== "ADMIN") {
      query.senderId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await NotificationHistory.find(query)
      .sort({ scheduledAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email")
      .populate("senderId", "name email")
      .lean();

    const totalCount = await NotificationHistory.countDocuments(query);

    res.json({
      message: "Scheduled notifications retrieved successfully",
      status: 200,
      data: {
        notifications,
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
    console.error("Error retrieving scheduled notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Cancel a scheduled notification
const cancelScheduledNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationHistory.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Scheduled notification not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Check permissions
    if (req.user.role !== "ADMIN" && notification.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only cancel your own scheduled notifications",
        status: 403,
        success: false,
        error: true,
      });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({
        message: "Can only cancel pending notifications",
        status: 400,
        success: false,
        error: true,
      });
    }

    notification.status = "cancelled";
    await notification.save();

    res.json({
      message: "Scheduled notification cancelled successfully",
      status: 200,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error cancelling scheduled notification:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Update a scheduled notification
const updateScheduledNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { title, body, data, scheduledAt, options } = req.body;

    const notification = await NotificationHistory.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Scheduled notification not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Check permissions
    if (req.user.role !== "ADMIN" && notification.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Access denied. You can only update your own scheduled notifications",
        status: 403,
        success: false,
        error: true,
      });
    }

    if (notification.status !== "pending") {
      return res.status(400).json({
        message: "Can only update pending notifications",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Update fields if provided
    if (title) notification.title = title;
    if (body) notification.body = body;
    if (data) notification.data = { ...notification.data, ...data };

    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt);
      const now = new Date();

      if (scheduledDate <= now) {
        return res.status(400).json({
          message: "scheduledAt must be in the future",
          status: 400,
          success: false,
          error: true,
        });
      }

      notification.scheduledAt = scheduledDate;
    }

    if (options) {
      if (options.category) notification.category = options.category;
      if (options.type) notification.type = options.type;
      if (options.priority) notification.priority = options.priority;
    }

    await notification.save();

    res.json({
      message: "Scheduled notification updated successfully",
      status: 200,
      data: notification,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error updating scheduled notification:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Process scheduled notifications (cron job endpoint)
const processScheduledNotifications = async (req, res) => {
  try {
    // This endpoint should be protected and only called by cron jobs or admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin role required",
        status: 403,
        success: false,
        error: true,
      });
    }

    const result = await notificationService.processScheduledNotifications();

    res.json({
      message: "Scheduled notifications processed successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error processing scheduled notifications:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get scheduling statistics
const getSchedulingStats = async (req, res) => {
  try {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats = await NotificationHistory.aggregate([
      {
        $match: {
          status: "pending",
          scheduledAt: { $gte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalScheduled: { $sum: 1 },
          scheduledNext24Hours: {
            $sum: {
              $cond: [{ $lte: ["$scheduledAt", oneDayFromNow] }, 1, 0],
            },
          },
          scheduledNextWeek: {
            $sum: {
              $cond: [{ $lte: ["$scheduledAt", oneWeekFromNow] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Get category breakdown for scheduled notifications
    const categoryBreakdown = await NotificationHistory.aggregate([
      {
        $match: {
          status: "pending",
          scheduledAt: { $gte: now },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      message: "Scheduling statistics retrieved successfully",
      status: 200,
      data: {
        overall: stats[0] || { totalScheduled: 0, scheduledNext24Hours: 0, scheduledNextWeek: 0 },
        categoryBreakdown,
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving scheduling statistics:", error);
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
  scheduleNotification,
  getScheduledNotifications,
  cancelScheduledNotification,
  updateScheduledNotification,
  processScheduledNotifications,
  getSchedulingStats,
};
