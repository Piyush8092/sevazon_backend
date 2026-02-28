const mongoose = require("mongoose");

const notificationHistorySchema = new mongoose.Schema(
  {
    // Recipient information
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
      index: true,
    },
    fcmTokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FCMToken",
      index: true,
    },

    // Notification content
    title: {
      type: String,
      required: [true, "Notification title is required"],
    },
    body: {
      type: String,
      required: [true, "Notification body is required"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // Additional data payload
      default: {},
    },

    // Notification metadata
    category: {
      type: String,
      required: [true, "Notification category is required"],
      enum: [
        "chat",
        "calls",
        "services",
        "bookings",
        "payments",
        "jobs",
        "property",
        "news",
        "system",
      ],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Notification type is required"],
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
      index: true,
    },

    // Delivery information
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    deliveryAttempts: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },

    // Timestamps
    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    sentAt: Date,
    deliveredAt: Date,
    failedAt: Date,

    // Error information
    errorDetails: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
    },

    // FCM response
    fcmResponse: {
      messageId: String,
      success: Boolean,
      error: mongoose.Schema.Types.Mixed,
    },

    // Related entity information
    relatedEntity: {
      entityType: {
        type: String,
        enum: ["job", "property", "service", "news", "booking", "payment", "chat", "user"],
      },
      entityId: mongoose.Schema.Types.Mixed, // Can be ObjectId or String (for chat conversations)
    },

    // Sender information (for notifications triggered by other users)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // Batch information (for bulk notifications)
    batchId: {
      type: String,
      index: true,
    },

    // User interaction tracking
    userInteraction: {
      opened: {
        type: Boolean,
        default: false,
      },
      openedAt: Date,
      clicked: {
        type: Boolean,
        default: false,
      },
      clickedAt: Date,
      dismissed: {
        type: Boolean,
        default: false,
      },
      dismissedAt: Date,
    },
  },
  {
    timestamps: true,
    // Add compound indexes for efficient queries
    indexes: [
      { userId: 1, createdAt: -1 },
      { category: 1, type: 1, createdAt: -1 },
      { status: 1, scheduledAt: 1 },
      { batchId: 1, status: 1 },
      { "relatedEntity.entityType": 1, "relatedEntity.entityId": 1 },
    ],
  }
);

// Instance method to mark notification as sent
notificationHistorySchema.methods.markAsSent = function (fcmResponse) {
  this.status = "sent";
  this.sentAt = new Date();
  this.fcmResponse = fcmResponse;
  return this.save();
};

// Instance method to mark notification as delivered
notificationHistorySchema.methods.markAsDelivered = function () {
  this.status = "delivered";
  this.deliveredAt = new Date();
  return this.save();
};

// Instance method to mark notification as failed
notificationHistorySchema.methods.markAsFailed = function (error) {
  this.status = "failed";
  this.failedAt = new Date();
  this.deliveryAttempts += 1;

  if (error) {
    this.errorDetails = {
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || "Unknown error occurred",
      details: error,
    };
  }

  return this.save();
};

// Instance method to track user interaction
notificationHistorySchema.methods.trackInteraction = function (interactionType) {
  const now = new Date();

  switch (interactionType) {
    case "opened":
      this.userInteraction.opened = true;
      this.userInteraction.openedAt = now;
      break;
    case "clicked":
      this.userInteraction.clicked = true;
      this.userInteraction.clickedAt = now;
      break;
    case "dismissed":
      this.userInteraction.dismissed = true;
      this.userInteraction.dismissedAt = now;
      break;
  }

  return this.save();
};

// Static method to get delivery statistics
notificationHistorySchema.statics.getDeliveryStats = function (filters = {}) {
  const matchStage = { ...filters };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        opened: { $sum: { $cond: ["$userInteraction.opened", 1, 0] } },
        clicked: { $sum: { $cond: ["$userInteraction.clicked", 1, 0] } },
      },
    },
    {
      $addFields: {
        deliveryRate: { $divide: ["$delivered", "$totalNotifications"] },
        openRate: { $divide: ["$opened", "$totalNotifications"] },
        clickRate: { $divide: ["$clicked", "$totalNotifications"] },
      },
    },
  ]);
};

// Static method to cleanup old notifications
notificationHistorySchema.statics.cleanupOldNotifications = function (daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: { $in: ["delivered", "failed"] },
  });
};

const NotificationHistory = mongoose.model("NotificationHistory", notificationHistorySchema);

module.exports = NotificationHistory;
