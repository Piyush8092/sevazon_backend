const mongoose = require("mongoose");

const CallHistorySchema = new mongoose.Schema(
  {
    // Unique identifier from Agora call
    callId: {
      type: String,
      required: [true, "Call ID is required"],
      unique: true,
      index: true,
    },
    
    // Channel name used in Agora
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
    },
    
    // User who initiated or received the call
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: [true, "User ID is required"],
      index: true,
    },
    
    // Contact who was called or who called
    contactId: {
      type: String,
      required: [true, "Contact ID is required"],
    },
    
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
    },
    
    contactAvatar: {
      type: String,
      default: null,
    },
    
    contactPhone: {
      type: String,
      default: null,
    },
    
    // Call type: voice or video
    callType: {
      type: String,
      enum: ["voice", "video"],
      required: [true, "Call type is required"],
    },
    
    // Call direction: incoming or outgoing
    direction: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: [true, "Call direction is required"],
    },
    
    // Call status: missed, rejected, completed, connecting, answered, ended, etc.
    status: {
      type: String,
      enum: ["connecting", "ringing", "answered", "completed", "ended", "missed", "rejected", "cancelled", "failed"],
      required: [true, "Call status is required"],
    },
    
    // Start time of call
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    
    // End time of call
    endTime: {
      type: Date,
      default: null,
    },
    
    // Duration in seconds
    duration: {
      type: Number,
      default: null,
    },
    
    // Agora specific data
    agoraData: {
      token: {
        type: String,
        default: null,
      },
      uid: {
        type: Number,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
CallHistorySchema.index({ userId: 1, startTime: -1 });
CallHistorySchema.index({ callId: 1 });

// Virtual for calculating duration if not provided
CallHistorySchema.virtual("calculatedDuration").get(function () {
  if (this.duration !== null) {
    return this.duration;
  }
  if (this.startTime && this.endTime) {
    return Math.floor((this.endTime - this.startTime) / 1000);
  }
  return null;
});

// Prevent model re-registration error
module.exports = mongoose.models.CallHistory || mongoose.model("CallHistory", CallHistorySchema);
