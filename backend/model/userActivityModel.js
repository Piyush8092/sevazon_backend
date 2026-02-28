const mongoose = require("mongoose");

/**
 * User Activity Tracking Model
 * Tracks user interactions for personalized recommendations
 */
const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        "view_service",
        "view_job",
        "view_ad",
        "view_matrimony",
        "view_property",
        "view_offer",
        "view_news",
        "search",
        "category_click",
        "subcategory_click",
        "bookmark",
        "like",
        "share",
        "apply_job",
        "contact_view",
      ],
      required: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: [
        "service",
        "job",
        "ad",
        "matrimony",
        "property",
        "offer",
        "news",
        "category",
        "subcategory",
      ],
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    subcategory: {
      type: String,
      index: true,
    },
    searchQuery: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      index: true,
    },
    deviceInfo: {
      platform: String,
      version: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, activityType: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, contentType: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, category: 1, timestamp: -1 });

// TTL index to automatically delete old activities after 90 days
userActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const UserActivity = mongoose.model("UserActivity", userActivitySchema);

module.exports = UserActivity;
