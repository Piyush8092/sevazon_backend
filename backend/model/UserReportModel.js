const mongoose = require("mongoose");

/**
 * User Report Model
 * Centralized model for tracking user reports
 * Allows users to report other users for inappropriate behavior
 */
const userReportSchema = new mongoose.Schema(
  {
    // Reporter Information
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Reporter ID is required"],
    },

    // Reported User Information
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Reported user ID is required"],
    },

    // Report Details
    reason: {
      type: String,
      enum: [
        "Spam or Scam",
        "Inappropriate Content",
        "Harassment or Bullying",
        "Fake Profile",
        "Offensive Behavior",
        "Fraudulent Activity",
        "Impersonation",
        "Other",
      ],
      required: [true, "Reason is required"],
    },

    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },

    // Context Information (where the report was made from)
    contextType: {
      type: String,
      enum: [
        "service_profile",
        "job_post",
        "matrimony_profile",
        "property_post",
        "offer_post",
        "news_post",
        "chat",
        "direct_user",
        "other",
      ],
      default: "direct_user",
    },

    contextId: {
      type: String, // ID of the profile/post/chat where report was made
      default: null,
    },

    // Admin Review Status
    status: {
      type: String,
      enum: ["pending", "reviewed", "action_taken", "dismissed"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminNotes: {
      type: String,
      default: "",
    },

    actionTaken: {
      type: String,
      enum: ["none", "warning_sent", "user_blocked", "content_removed", "account_suspended"],
      default: "none",
    },
  },
  { timestamps: true }
);

// Index for faster queries
userReportSchema.index({ reporterId: 1, reportedUserId: 1 });
userReportSchema.index({ status: 1 });
userReportSchema.index({ createdAt: -1 });

const UserReport = mongoose.model("UserReport", userReportSchema);

module.exports = UserReport;
