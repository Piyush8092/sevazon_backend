const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },

    // Contact Information
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Invalid email format",
      },
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits",
      },
    },

    // Feedback Content
    message: {
      type: String,
      required: [true, "Feedback message is required"],
      minlength: [10, "Feedback message must be at least 10 characters"],
      maxlength: [2000, "Feedback message cannot exceed 2000 characters"],
    },

    // Status Management
    status: {
      type: String,
      enum: ["new", "reviewed", "resolved"],
      default: "new",
    },

    // Admin Notes (optional)
    adminNotes: {
      type: String,
      default: "",
    },

    // Reviewed By (admin user ID)
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },

    // Reviewed At
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

const FeedbackModel = mongoose.model("FeedbackModel", feedbackSchema);

module.exports = FeedbackModel;
