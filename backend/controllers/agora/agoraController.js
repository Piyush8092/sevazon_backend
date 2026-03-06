const agoraService = require("../../services/agoraService");
const { validationResult } = require("express-validator");
const notificationService = require("../../services/notificationService");
const CallHistory = require("../../model/CallHistoryModel");

/**
 * Agora Controller
 * Handles all Agora-related API endpoints for voice/video calling
 */
class AgoraController {
  /**
   * Generate Agora token for a channel
   * POST /api/generate-call-token
   */
  async generateToken(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { channelName, userId, role = "publisher" } = req.body;

      console.log(`🔄 Generating token for channel: ${channelName}, user: ${userId}`);

      const tokenData = agoraService.generateToken(channelName, userId, role);

      res.status(200).json({
        success: true,
        message: "Token generated successfully",
        data: tokenData,
      });
    } catch (error) {
      console.error("❌ Error in generateToken:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate token",
        error: error.message,
      });
    }
  }

  /**
   * Initiate a call between two users
   * POST /api/initiate-call
   */
  async initiateCall(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { calleeId, callType = "voice" } = req.body;
      const callerId = req.user?.id || req.body.callerId; // Get from auth middleware or request body

      if (!callerId) {
        return res.status(401).json({
          success: false,
          message: "Caller ID is required",
        });
      }

      // Validate calleeId
      if (!calleeId || calleeId.trim() === "") {
        console.error("❌ Invalid calleeId:", calleeId);
        return res.status(400).json({
          success: false,
          message: "Callee ID is required and cannot be empty",
        });
      }

      if (callerId === calleeId) {
        return res.status(400).json({
          success: false,
          message: "Cannot call yourself",
        });
      }

      console.log(`📞 Initiating ${callType} call from ${callerId} to ${calleeId}`);

      const callData = agoraService.initiateCall(callerId, calleeId, callType);

      // Send FCM notification to callee about incoming call
      try {
        // Get caller information to include in notification
        const User = require("../../model/userModel");
        let callerName = "Unknown";
        let callerAvatar = "";
        let callerPhone = "";

        console.log(`🔍 Fetching caller info for callerId: ${callerId}`);
        try {
          const caller = await User.findById(callerId).select("name profilePicture phone");
          if (caller) {
            callerName = caller.name || "Unknown";
            callerAvatar = caller.profilePicture || "";
            callerPhone = caller.phone || "";
            console.log(`✅ Caller info found: ${callerName} (${callerPhone})`);
          } else {
            console.warn(`⚠️ No caller found with ID: ${callerId}`);
          }
        } catch (userError) {
          console.warn("⚠️ Could not fetch caller info:", userError.message);
        }

        console.log(`🔍 Sending notification to calleeId: ${calleeId}`);

        // Verify callee exists
        try {
          const callee = await User.findById(calleeId).select("name");
          if (callee) {
            console.log(`✅ Callee found: ${callee.name} (ID: ${calleeId})`);
          } else {
            console.error(`❌ Callee not found with ID: ${calleeId}`);
          }
        } catch (calleeError) {
          console.error(`❌ Error checking callee: ${calleeError.message}`);
        }

        // CRITICAL FIX: FCM data payload must only contain string values
        // Convert all values to strings to avoid "data must only contain string values" error
        await notificationService.sendToUser(
          calleeId,
          "Incoming Call",
          `${callerName} is calling you`,
          {
            type: "call", // Changed from 'incoming_call' to match Flutter NotificationType enum
            callId: String(callData.callId),
            callerId: String(callerId),
            callerName: String(callerName),
            callerAvatar: String(callerAvatar),
            callerPhone: String(callerPhone),
            callType: String(callType),
            channelName: String(callData.channelName),
          },
          {
            category: "calls",
            type: "incoming_call",
            priority: "high",
            android: {
              priority: "high",
              notification: {
                sound: "call_ringtone",
                channelId: "calls",
              },
            },
            ios: {
              sound: "call_ringtone.wav",
              badge: 1,
            },
          }
        );
        console.log(
          `📨 FCM notification sent to ${calleeId} about incoming call from ${callerName}`
        );
      } catch (notificationError) {
        console.error("❌ Failed to send call notification:", notificationError);
        // Don't fail the call initiation if notification fails
      }

      res.status(201).json({
        success: true,
        message: "Call initiated successfully",
        data: callData,
      });
    } catch (error) {
      console.error("❌ Error in initiateCall:", error);
      res.status(500).json({
        success: false,
        message: "Failed to initiate call",
        error: error.message,
      });
    }
  }

  /**
   * Answer a call
   * POST /api/answer-call/:callId
   */
  async answerCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user?.id || req.body.userId; // Get from auth middleware or request body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID is required",
        });
      }

      console.log(`✅ User ${userId} answering call ${callId}`);

      const callData = agoraService.answerCall(callId, userId);

      // CRITICAL FIX: DO NOT generate a new token - reuse the existing callee token
      // The callee token was already generated during initiateCall
      // Generating a new token creates a different UID which breaks the call flow

      // If callee token doesn't exist (e.g., server restart), generate it with the same UID
      if (!callData.callee.token || !callData.callee.uid) {
        console.warn(`⚠️ Callee token missing for call ${callId}, regenerating with stable UID`);

        // Generate token with stable UID based on userId
        const calleeToken = agoraService.generateToken(callData.channelName, userId, "publisher");

        // Update callData with callee's token information
        callData.callee = {
          ...callData.callee,
          ...calleeToken,
        };

        console.log(
          `✅ TokenGenerated: userId=${userId}, uid=${calleeToken.uid}, channel=${callData.channelName}`
        );
      } else {
        console.log(
          `✅ Reusing existing token: userId=${userId}, uid=${callData.callee.uid}, channel=${callData.channelName}`
        );
      }

      // Notify caller that call was answered
      try {
        console.log(
          `📨 Preparing to send 'call_answered' notification to caller: ${callData.caller.userId}`
        );

        // CRITICAL FIX: Convert all data values to strings for FCM
        const notificationResult = await notificationService.sendToUser(
          callData.caller.userId,
          "Call Answered",
          "Your call has been answered",
          {
            type: "call_answered",
            callId: String(callId),
            channelName: String(callData.channelName || ""),
            calleeToken: String(callData.callee.token || ""),
            calleeUid: String(callData.callee.uid || ""),
          },
          {
            category: "calls",
            type: "call_answered",
            priority: "high",
          }
        );

        if (notificationResult.success) {
          console.log(
            `✅ 'call_answered' notification sent successfully to caller: ${callData.caller.userId} - Delivered to ${notificationResult.successCount}/${notificationResult.totalTokens} devices`
          );
        } else {
          console.error(
            `❌ Failed to send 'call_answered' notification to caller: ${callData.caller.userId} - Reason: ${notificationResult.reason || notificationResult.error}`
          );
          if (notificationResult.reason === "no_tokens") {
            console.error(
              `   ⚠️ CRITICAL: Caller has no FCM tokens! User needs to login/refresh app.`
            );
          }
        }
      } catch (notificationError) {
        console.error(
          `❌ Exception while sending call answered notification to caller ${callData.caller.userId}:`,
          notificationError
        );
      }

      res.status(200).json({
        success: true,
        message: "Call answered successfully",
        data: callData,
      });
    } catch (error) {
      console.error("❌ Error in answerCall:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Unauthorized")
          ? 403
          : 500;

      res.status(statusCode).json({
        success: false,
        message: "Failed to answer call",
        error: error.message,
      });
    }
  }

  /**
   * Decline a call
   * POST /api/decline-call/:callId
   */
  async declineCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user?.id || req.body.userId; // Get from auth middleware or request body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID is required",
        });
      }

      console.log(`❌ User ${userId} declining call ${callId}`);

      const callData = agoraService.declineCall(callId, userId);

      // Notify caller that call was declined
      try {
        console.log(
          `📨 Preparing to send 'call_declined' notification to caller: ${callData.caller.userId}`
        );

        // CRITICAL FIX: Convert all data values to strings for FCM
        const notificationResult = await notificationService.sendToUser(
          callData.caller.userId,
          "Call Declined",
          "Your call was declined",
          {
            type: "call_declined",
            callId: String(callId),
          },
          {
            category: "calls",
            type: "call_declined",
            priority: "normal",
          }
        );

        if (notificationResult.success) {
          console.log(
            `✅ 'call_declined' notification sent successfully to caller: ${callData.caller.userId}`
          );
        } else {
          console.error(
            `❌ Failed to send 'call_declined' notification to caller: ${callData.caller.userId} - Reason: ${notificationResult.reason || notificationResult.error}`
          );
        }
      } catch (notificationError) {
        console.error(`❌ Exception while sending call declined notification:`, notificationError);
      }

      res.status(200).json({
        success: true,
        message: "Call declined successfully",
        data: callData,
      });
    } catch (error) {
      console.error("❌ Error in declineCall:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Unauthorized")
          ? 403
          : 500;

      res.status(statusCode).json({
        success: false,
        message: "Failed to decline call",
        error: error.message,
      });
    }
  }

  /**
   * End a call
   * POST /api/end-call/:callId
   */
  async endCall(req, res) {
    try {
      const { callId } = req.params;
      const userId = req.user?.id || req.body.userId; // Get from auth middleware or request body

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User ID is required",
        });
      }

      console.log(`📴 User ${userId} ending call ${callId}`);

      const callData = agoraService.endCall(callId, userId);

      // Notify the other participant that call ended
      const otherUserId =
        callData.caller.userId === userId ? callData.callee.userId : callData.caller.userId;

      // Only send notification if other user is not 'unknown'
      if (otherUserId && otherUserId !== "unknown") {
        try {
          console.log(
            `📨 Preparing to send 'call_ended' notification to other user: ${otherUserId}`
          );

          // CRITICAL FIX: Convert all data values to strings for FCM
          const notificationResult = await notificationService.sendToUser(
            otherUserId,
            "Call Ended",
            "The call has ended",
            {
              type: "call_ended",
              callId: String(callId),
              duration: String(callData.duration || 0),
            },
            {
              category: "calls",
              type: "call_ended",
              priority: "normal",
            }
          );

          if (notificationResult.success) {
            console.log(`✅ 'call_ended' notification sent successfully to user: ${otherUserId}`);
          } else {
            console.error(
              `❌ Failed to send 'call_ended' notification to user: ${otherUserId} - Reason: ${notificationResult.reason || notificationResult.error}`
            );
          }
        } catch (notificationError) {
          console.error(`❌ Exception while sending call ended notification:`, notificationError);
        }
      } else {
        console.log(`⚠️ Skipping 'call_ended' notification - other user is unknown`);
      }

      res.status(200).json({
        success: true,
        message: "Call ended successfully",
        data: callData,
      });
    } catch (error) {
      console.error("❌ Error in endCall:", error);
      const statusCode = error.message.includes("not found")
        ? 404
        : error.message.includes("Unauthorized")
          ? 403
          : 500;

      res.status(statusCode).json({
        success: false,
        message: "Failed to end call",
        error: error.message,
      });
    }
  }

  /**
   * Get call information
   * GET /api/call/:callId
   */
  async getCall(req, res) {
    try {
      const { callId } = req.params;

      console.log(`📋 Getting call information for ${callId}`);

      const callData = agoraService.getCall(callId);

      res.status(200).json({
        success: true,
        message: "Call information retrieved successfully",
        data: callData,
      });
    } catch (error) {
      console.error("❌ Error in getCall:", error);
      const statusCode = error.message.includes("not found") ? 404 : 500;

      res.status(statusCode).json({
        success: false,
        message: "Failed to get call information",
        error: error.message,
      });
    }
  }

  /**
   * Get call history for a user
   * GET /api/call-history/:userId
   */
  async getCallHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;
      const requestingUserId = req.user?.id || req.query.requestingUserId;

      // Basic authorization check
      if (requestingUserId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this user's call history",
        });
      }

      console.log(`📋 Getting call history for user ${userId}`);

      // Get active calls from memory
      const activeCalls = agoraService.getUserActiveCalls(userId);

      // Get recent call history from database
      const recentCalls = await CallHistory.find({ userId })
        .sort({ startTime: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        message: "Call history retrieved successfully",
        data: {
          activeCalls,
          recentCalls,
          totalActiveCalls: activeCalls.length,
          totalRecentCalls: recentCalls.length,
        },
      });
    } catch (error) {
      console.error("❌ Error in getCallHistory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get call history",
        error: error.message,
      });
    }
  }

  /**
   * Get Agora service status
   * GET /api/agora/status
   */
  async getStatus(req, res) {
    try {
      const status = agoraService.getStatus();

      res.status(200).json({
        success: true,
        message: "Agora service status retrieved successfully",
        data: status,
      });
    } catch (error) {
      console.error("❌ Error in getStatus:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get service status",
        error: error.message,
      });
    }
  }

  /**
   * Reset to primary certificate (admin only)
   * POST /api/agora/reset-certificate
   */
  async resetToPrimaryCertificate(req, res) {
    try {
      const result = agoraService.resetToPrimaryCertificate();

      if (result) {
        res.status(200).json({
          success: true,
          message: "Successfully reset to primary certificate",
          data: {
            currentCertificate: "primary",
            timestamp: new Date(),
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Primary certificate not available",
        });
      }
    } catch (error) {
      console.error("❌ Error in resetToPrimaryCertificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset certificate",
        error: error.message,
      });
    }
  }

  /**
   * Switch to backup certificate (admin only)
   * POST /api/agora/switch-certificate
   */
  async switchToBackupCertificate(req, res) {
    try {
      const result = agoraService.switchToBackupCertificate();

      if (result) {
        res.status(200).json({
          success: true,
          message: "Successfully switched to backup certificate",
          data: {
            currentCertificate: "backup",
            timestamp: new Date(),
          },
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Backup certificate not available",
        });
      }
    } catch (error) {
      console.error("❌ Error in switchToBackupCertificate:", error);
      res.status(500).json({
        success: false,
        message: "Failed to switch certificate",
        error: error.message,
      });
    }
  }

  /**
   * Save call history to database
   * POST /api/save-call-history
   */
  async saveCallHistory(req, res) {
    try {
      const {
        id: callId,
        channelName,
        contactId,
        contactName,
        contactAvatar,
        contactPhone,
        type: callType,
        direction,
        status,
        startTime,
        endTime,
        duration,
        agoraToken,
        agoraUid,
      } = req.body;

      // Get user ID from authenticated user
      const userId = req.user?._id || req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // Validate required fields
      if (!callId || !channelName || !contactId || !contactName || !callType || !direction || !status || !startTime) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
          required: ["id", "channelName", "contactId", "contactName", "type", "direction", "status", "startTime"],
        });
      }

      console.log(`📝 Saving call history for user ${userId}, call ${callId}`);

      // Check if call history already exists
      let callHistory = await CallHistory.findOne({ callId });

      if (callHistory) {
        // Update existing call history
        callHistory.contactName = contactName;
        callHistory.contactAvatar = contactAvatar || callHistory.contactAvatar;
        callHistory.contactPhone = contactPhone || callHistory.contactPhone;
        callHistory.status = status;
        callHistory.endTime = endTime || callHistory.endTime;
        callHistory.duration = duration || callHistory.duration;
        
        // Calculate duration if not provided but we have start and end times
        if (!callHistory.duration && callHistory.endTime) {
          callHistory.duration = Math.floor((new Date(callHistory.endTime) - new Date(callHistory.startTime)) / 1000);
        }

        await callHistory.save();

        console.log(`✅ Updated call history for call ${callId}`);

        return res.status(200).json({
          success: true,
          message: "Call history updated successfully",
          data: callHistory,
        });
      }

      // Create new call history
      callHistory = new CallHistory({
        callId,
        channelName,
        userId,
        contactId,
        contactName,
        contactAvatar,
        contactPhone,
        callType,
        direction,
        status,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration,
        agoraData: {
          token: agoraToken,
          uid: agoraUid,
        },
      });

      // Calculate duration if not provided but we have start and end times
      if (!callHistory.duration && callHistory.endTime) {
        callHistory.duration = Math.floor((callHistory.endTime - callHistory.startTime) / 1000);
      }

      await callHistory.save();

      console.log(`✅ Saved new call history for call ${callId}`);

      res.status(201).json({
        success: true,
        message: "Call history saved successfully",
        data: callHistory,
      });
    } catch (error) {
      console.error("❌ Error in saveCallHistory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save call history",
        error: error.message,
      });
    }
  }

  /**
   * Get user's call history from database
   * GET /api/user-call-history/:userId?limit=20&offset=0
   */
  async getUserCallHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 20, offset = 0, status, callType } = req.query;

      // Get requesting user ID
      const requestingUserId = req.user?._id?.toString() || req.user?.userId?.toString();

      // Basic authorization check
      if (requestingUserId !== userId && !req.user?.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized to access this user's call history",
        });
      }

      console.log(`📋 Getting database call history for user ${userId}`);

      // Build query
      const query = { userId };
      if (status) query.status = status;
      if (callType) query.callType = callType;

      // Get total count
      const total = await CallHistory.countDocuments(query);

      // Get paginated results
      const callHistory = await CallHistory.find(query)
        .sort({ startTime: -1 }) // Most recent first
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      res.status(200).json({
        success: true,
        message: "Call history retrieved successfully",
        data: {
          calls: callHistory,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: total > parseInt(offset) + callHistory.length,
          },
        },
      });
    } catch (error) {
      console.error("❌ Error in getUserCallHistory:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get call history",
        error: error.message,
      });
    }
  }
}

module.exports = new AgoraController();
