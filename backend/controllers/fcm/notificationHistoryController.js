const NotificationHistory = require("../../model/notificationHistoryModel");

// Get user's notification history
const getUserNotificationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, category, status, startDate, endDate } = req.query;

    // Build query
    const query = { userId };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications with pagination
    const notifications = await NotificationHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("senderId", "name email")
      .lean();

    // Get total count for pagination
    const totalCount = await NotificationHistory.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      message: "Notification history retrieved successfully",
      status: 200,
      data: {
        notifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving notification history:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Mark notification as read/opened
const markNotificationAsOpened = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await NotificationHistory.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    await notification.trackInteraction("opened");

    res.json({
      message: "Notification marked as opened",
      status: 200,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error marking notification as opened:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Mark notification as clicked
const markNotificationAsClicked = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await NotificationHistory.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    await notification.trackInteraction("clicked");

    res.json({
      message: "Notification marked as clicked",
      status: 200,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error marking notification as clicked:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Get notification statistics for user
const getUserNotificationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const stats = await NotificationHistory.getDeliveryStats({
      userId,
      createdAt: { $gte: startDate },
    });

    // Get category breakdown
    const categoryStats = await NotificationHistory.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          opened: { $sum: { $cond: ["$userInteraction.opened", 1, 0] } },
          clicked: { $sum: { $cond: ["$userInteraction.clicked", 1, 0] } },
        },
      },
    ]);

    res.json({
      message: "Notification statistics retrieved successfully",
      status: 200,
      data: {
        overall: stats[0] || {},
        categoryBreakdown: categoryStats,
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

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await NotificationHistory.countDocuments({
      userId,
      "userInteraction.opened": false,
      status: { $in: ["sent", "delivered"] },
    });

    res.json({
      message: "Unread notification count retrieved successfully",
      status: 200,
      data: { unreadCount },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error retrieving unread notification count:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    const result = await NotificationHistory.updateMany(
      {
        userId,
        "userInteraction.opened": false,
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: {
          "userInteraction.opened": true,
          "userInteraction.openedAt": new Date(),
        },
      }
    );

    res.json({
      message: "All notifications marked as read",
      status: 200,
      data: { updatedCount: result.modifiedCount },
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

// Delete notification (soft delete by marking as dismissed)
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await NotificationHistory.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    await notification.trackInteraction("dismissed");

    res.json({
      message: "Notification deleted successfully",
      status: 200,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
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
  getUserNotificationHistory,
  markNotificationAsOpened,
  markNotificationAsClicked,
  getUserNotificationStats,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
};
