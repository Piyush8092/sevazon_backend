const { RtcTokenBuilder, RtcRole } = require("agora-token");
const crypto = require("crypto");

// UUID replacement using Node.js built-in crypto
const uuidv4 = () => {
  return crypto.randomUUID();
};

/**
 * Agora Service for handling video/voice call functionality
 * Provides token generation, channel management, and call state tracking
 */
class AgoraService {
  constructor() {
    // Agora App ID and App Certificate from environment variables
    this.appId = process.env.AGORA_APP_ID || "400bb82ebad34539aebcb6de61e5a976";
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.appCertificateBackup = process.env.AGORA_APP_CERTIFICATE_BACKUP;

    // For development, provide a fallback certificate if not set
    if (!this.appCertificate && process.env.NODE_ENV === "development") {
      // This is a placeholder certificate for development only
      // In production, you MUST set the AGORA_APP_CERTIFICATE environment variable
      console.warn(
        "⚠️ Using development fallback certificate. Set AGORA_APP_CERTIFICATE for production!"
      );
      this.appCertificate = "development_certificate_placeholder";
    }

    this.currentCertificate = this.appCertificate; // Track which certificate is currently being used

    // Token expiration time (24 hours)
    this.tokenExpirationInSeconds = 24 * 60 * 60;

    // In-memory storage for active calls (in production, use Redis or database)
    this.activeCalls = new Map();

    console.log("🎥 AgoraService initialized");
    console.log(`📱 App ID: ${this.appId}`);
    console.log(`🔐 App Certificate: ${this.appCertificate ? "Configured" : "Not configured"}`);
    console.log(
      `🔐 Backup Certificate: ${this.appCertificateBackup ? "Available" : "Not available"}`
    );
    console.log(`🔐 Current Certificate: ${this.currentCertificate ? "Active" : "None"}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  }

  /**
   * Generate Agora RTC token for a channel
   * @param {string} channelName - The channel name
   * @param {string} userId - The user ID
   * @param {string} role - The user role ('publisher' or 'subscriber')
   * @param {number} existingUid - Optional existing UID to reuse
   * @returns {Object} Token and channel information
   */
  generateToken(channelName, userId, role = "publisher", existingUid = null) {
    try {
      // Validate inputs
      if (!channelName || typeof channelName !== "string") {
        throw new Error("Invalid channelName: must be a non-empty string");
      }
      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid userId: must be a non-empty string");
      }

      // Use existing UID if provided, otherwise generate stable UID from userId
      const uid = existingUid || this.generateUid(userId);

      // For development mode without proper certificate
      if (
        !this.currentCertificate ||
        this.currentCertificate === "development_certificate_placeholder"
      ) {
        console.warn("⚠️ Development mode: Using null token (certificate not properly configured)");
        return {
          token: null,
          channelName,
          userId,
          uid,
          expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
          appId: this.appId,
          certificateStatus: "not_configured",
          developmentMode: true,
        };
      }

      // Determine Agora role
      const agoraRole = role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      // Calculate expiration time
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + this.tokenExpirationInSeconds;

      // Try to generate token with current certificate
      let token;
      let certificateUsed = "primary";

      try {
        token = RtcTokenBuilder.buildTokenWithUid(
          this.appId,
          this.currentCertificate,
          channelName,
          uid,
          agoraRole,
          privilegeExpiredTs
        );

        console.log(
          `✅ Generated token with ${this.currentCertificate === this.appCertificate ? "primary" : "backup"} certificate`
        );
      } catch (tokenError) {
        console.error(
          `❌ Failed to generate token with ${this.currentCertificate === this.appCertificate ? "primary" : "backup"} certificate:`,
          tokenError
        );

        // Try fallback to backup certificate if available and not already using it
        if (this.appCertificateBackup && this.currentCertificate !== this.appCertificateBackup) {
          console.log("🔄 Attempting fallback to backup certificate...");

          try {
            token = RtcTokenBuilder.buildTokenWithUid(
              this.appId,
              this.appCertificateBackup,
              channelName,
              uid,
              agoraRole,
              privilegeExpiredTs
            );

            // Switch to backup certificate for future requests
            this.currentCertificate = this.appCertificateBackup;
            certificateUsed = "backup";

            console.log("✅ Successfully generated token with backup certificate");
            console.log("🔄 Switched to backup certificate for future requests");
          } catch (backupError) {
            console.error("❌ Backup certificate also failed:", backupError);

            // Fallback for development
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ Falling back to null token for development");
              return {
                token: null,
                channelName,
                userId,
                uid,
                expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
                appId: this.appId,
                certificateStatus: "error",
                developmentMode: true,
                error: `Both certificates failed. Primary: ${tokenError.message}, Backup: ${backupError.message}`,
              };
            }

            throw new Error(
              `Both primary and backup certificates failed. Primary: ${tokenError.message}, Backup: ${backupError.message}`
            );
          }
        } else {
          // Fallback for development
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Falling back to null token for development");
            return {
              token: null,
              channelName,
              userId,
              uid,
              expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
              appId: this.appId,
              certificateStatus: "error",
              developmentMode: true,
              error: tokenError.message,
            };
          }

          throw tokenError;
        }
      }

      console.log(`✅ Generated token for channel: ${channelName}, user: ${userId}, uid: ${uid}`);

      return {
        token,
        channelName,
        userId,
        uid,
        expiresAt: privilegeExpiredTs * 1000,
        appId: this.appId,
        certificateUsed,
        certificateStatus: "configured",
        developmentMode: false,
      };
    } catch (error) {
      console.error("❌ Error generating Agora token:", error);

      // Fallback for development
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ Falling back to null token for development");
        return {
          token: null,
          channelName,
          userId,
          uid: this.generateUid(),
          expiresAt: Date.now() + this.tokenExpirationInSeconds * 1000,
          appId: this.appId,
          certificateStatus: "error",
          developmentMode: true,
          error: error.message,
        };
      }

      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  /**
   * Generate a stable UID for Agora based on userId
   * This ensures the same user always gets the same UID for consistency
   * @param {string} userId - The user ID
   * @returns {number} Stable UID (1-4294967295)
   */
  generateUid(userId) {
    if (!userId) {
      // Fallback to random if no userId provided
      return Math.floor(Math.random() * 1000000) + 1;
    }

    // Create a stable hash from userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Ensure positive number within Agora's UID range (1 to 2^32-1)
    const uid = (Math.abs(hash) % 4294967295) + 1;

    console.log(`🔢 Generated stable UID ${uid} for userId: ${userId}`);
    return uid;
  }

  /**
   * Generate a unique channel name
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Unique channel name (max 64 characters for Agora)
   */
  generateChannelName(userId1, userId2) {
    // Sort user IDs to ensure consistent channel names
    const sortedIds = [userId1, userId2].sort();

    // Clean user IDs to ensure they're alphanumeric
    const cleanId1 = sortedIds[0].replace(/[^a-zA-Z0-9]/g, "");
    const cleanId2 = sortedIds[1].replace(/[^a-zA-Z0-9]/g, "");

    // Take last 6 chars of each user ID to keep channel name short
    const shortId1 = cleanId1.length > 6 ? cleanId1.substring(cleanId1.length - 6) : cleanId1;
    const shortId2 = cleanId2.length > 6 ? cleanId2.substring(cleanId2.length - 6) : cleanId2;

    // Use shorter timestamp (last 8 digits)
    const timestamp = Date.now().toString();
    const shortTimestamp = timestamp.substring(timestamp.length - 8);

    const channelName = `call${shortId1}${shortId2}${shortTimestamp}`;

    // Ensure channel name is under 64 characters (Agora's limit)
    return channelName.length > 64 ? channelName.substring(0, 64) : channelName;
  }

  /**
   * Initiate a call between two users
   * @param {string} callerId - The caller's user ID
   * @param {string} calleeId - The callee's user ID
   * @param {string} callType - 'voice' or 'video'
   * @returns {Object} Call information
   */
  initiateCall(callerId, calleeId, callType = "voice") {
    try {
      // Validate inputs
      if (!callerId || typeof callerId !== "string") {
        throw new Error("Invalid callerId: must be a non-empty string");
      }
      if (!calleeId || typeof calleeId !== "string") {
        throw new Error("Invalid calleeId: must be a non-empty string");
      }
      if (!["voice", "video"].includes(callType)) {
        throw new Error('Invalid callType: must be "voice" or "video"');
      }

      const callId = uuidv4();
      const channelName = this.generateChannelName(callerId, calleeId);

      // Generate tokens for both users with stable UIDs
      const callerToken = this.generateToken(channelName, callerId, "publisher");
      const calleeToken = this.generateToken(channelName, calleeId, "publisher");

      const callData = {
        callId,
        channelName,
        callType,
        status: "initiated",
        caller: {
          userId: callerId,
          ...callerToken,
        },
        callee: {
          userId: calleeId,
          ...calleeToken,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store call data
      this.activeCalls.set(callId, callData);

      console.log(
        `📞 CallInitiated: callId=${callId}, type=${callType}, caller=${callerId}, callee=${calleeId}, channel=${channelName}`
      );
      console.log(`   - Caller UID: ${callerToken.uid}`);
      console.log(`   - Callee UID: ${calleeToken.uid}`);

      return callData;
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      throw new Error(`Failed to initiate call: ${error.message}`);
    }
  }

  /**
   * Answer a call
   * @param {string} callId - The call ID
   * @param {string} userId - The user answering the call
   * @returns {Object} Updated call information
   */
  answerCall(callId, userId) {
    try {
      // Validate inputs
      if (!callId || typeof callId !== "string") {
        throw new Error("Invalid callId: must be a non-empty string");
      }
      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid userId: must be a non-empty string");
      }

      let call = this.activeCalls.get(callId);

      // If call not found in memory, create a minimal call object
      // This handles cases where the call was lost due to server restart
      if (!call) {
        console.warn(
          `⚠️ Call ${callId} not found in memory, creating minimal call object for answer`
        );
        call = {
          callId,
          status: "initiated",
          caller: { userId: "unknown" },
          callee: { userId: userId },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Verify the user is the callee (or callee is unknown)
      if (call.callee.userId !== "unknown" && call.callee.userId !== userId) {
        throw new Error("Unauthorized to answer this call");
      }

      call.status = "active";
      call.answeredAt = new Date();
      call.updatedAt = new Date();

      this.activeCalls.set(callId, call);

      console.log(
        `✅ CallAccepted: callId=${callId}, userId=${userId}, channel=${call.channelName || "unknown"}`
      );

      return call;
    } catch (error) {
      console.error("❌ Error answering call:", error);
      throw new Error(`Failed to answer call: ${error.message}`);
    }
  }

  /**
   * End a call
   * @param {string} callId - The call ID
   * @param {string} userId - The user ending the call
   * @returns {Object} Final call information
   */
  endCall(callId, userId) {
    try {
      // Validate inputs
      if (!callId || typeof callId !== "string") {
        throw new Error("Invalid callId: must be a non-empty string");
      }
      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid userId: must be a non-empty string");
      }

      // First check in-memory storage
      let call = this.activeCalls.get(callId);

      // If not found in memory, create a minimal call object
      // This handles cases where the call was lost due to server restart
      if (!call) {
        console.warn(`⚠️ Call ${callId} not found in memory, creating minimal call object`);
        call = {
          callId,
          status: "initiated",
          caller: { userId: "unknown" },
          callee: { userId: "unknown" },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      // Prevent double-ending
      if (call.status === "ended") {
        console.log(`⚠️ Call ${callId} already ended, skipping duplicate end`);
        return call;
      }

      // Allow either participant to end the call (or allow if caller/callee is unknown)
      if (call.caller.userId !== "unknown" && call.callee.userId !== "unknown") {
        if (call.caller.userId !== userId && call.callee.userId !== userId) {
          throw new Error("Unauthorized to end this call");
        }
      }

      call.status = "ended";
      call.endedAt = new Date();
      call.endedBy = userId;
      call.updatedAt = new Date();

      // Calculate call duration if it was active
      if (call.answeredAt) {
        call.duration = Math.floor((call.endedAt - call.answeredAt) / 1000); // in seconds
      } else {
        call.duration = 0;
      }

      this.activeCalls.set(callId, call);

      console.log(`📴 CallEnded: callId=${callId}, endedBy=${userId}, duration=${call.duration}s`);

      // Remove from active calls after a delay (for cleanup) - only once
      if (!call._cleanupScheduled) {
        call._cleanupScheduled = true;
        setTimeout(() => {
          const stillExists = this.activeCalls.get(callId);
          if (stillExists) {
            this.activeCalls.delete(callId);
            console.log(`🗑️ Call ${callId} removed from active calls (cleanup)`);
          }
        }, 60000); // 1 minute delay
      }

      return call;
    } catch (error) {
      console.error("❌ Error ending call:", error);
      throw new Error(`Failed to end call: ${error.message}`);
    }
  }

  /**
   * Get call information
   * @param {string} callId - The call ID
   * @returns {Object} Call information
   */
  getCall(callId) {
    const call = this.activeCalls.get(callId);
    if (!call) {
      console.warn(`⚠️ Call ${callId} not found in memory`);
      // Return a minimal call object instead of throwing error
      return {
        callId,
        status: "unknown",
        message: "Call information not available (may have been cleared from memory)",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return call;
  }

  /**
   * Get all active calls for a user
   * @param {string} userId - The user ID
   * @returns {Array} Array of active calls
   */
  getUserActiveCalls(userId) {
    const userCalls = [];
    for (const call of this.activeCalls.values()) {
      if (
        (call.caller.userId === userId || call.callee.userId === userId) &&
        call.status !== "ended"
      ) {
        userCalls.push(call);
      }
    }
    return userCalls;
  }

  /**
   * Decline a call
   * @param {string} callId - The call ID
   * @param {string} userId - The user declining the call
   * @returns {Object} Updated call information
   */
  declineCall(callId, userId) {
    try {
      // Validate inputs
      if (!callId || typeof callId !== "string") {
        throw new Error("Invalid callId: must be a non-empty string");
      }
      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid userId: must be a non-empty string");
      }

      const call = this.activeCalls.get(callId);
      if (!call) {
        throw new Error("Call not found");
      }

      if (call.callee.userId !== userId) {
        throw new Error("Unauthorized to decline this call");
      }

      call.status = "declined";
      call.declinedAt = new Date();
      call.updatedAt = new Date();

      this.activeCalls.set(callId, call);

      console.log(`❌ CallDeclined: callId=${callId}, userId=${userId}`);

      return call;
    } catch (error) {
      console.error("❌ Error declining call:", error);
      throw new Error(`Failed to decline call: ${error.message}`);
    }
  }

  /**
   * Get service health status
   * @returns {Object} Service status
   */
  getStatus() {
    const isDevelopmentMode = process.env.NODE_ENV === "development";
    const isUsingPlaceholder = this.currentCertificate === "development_certificate_placeholder";

    return {
      status: "healthy",
      appId: this.appId,
      environment: process.env.NODE_ENV || "development",
      developmentMode: isDevelopmentMode,
      certificates: {
        primary: {
          configured:
            !!this.appCertificate && this.appCertificate !== "development_certificate_placeholder",
          value:
            this.appCertificate && this.appCertificate !== "development_certificate_placeholder"
              ? `${this.appCertificate.substring(0, 8)}...`
              : null,
          isPlaceholder: this.appCertificate === "development_certificate_placeholder",
        },
        backup: {
          configured: !!this.appCertificateBackup,
          value: this.appCertificateBackup
            ? `${this.appCertificateBackup.substring(0, 8)}...`
            : null,
        },
        currentlyUsing:
          this.currentCertificate === this.appCertificate
            ? "primary"
            : this.currentCertificate === this.appCertificateBackup
              ? "backup"
              : "none",
        usingPlaceholder: isUsingPlaceholder,
      },
      tokenGeneration: {
        willGenerateNullTokens: !this.currentCertificate || isUsingPlaceholder,
        reason: !this.currentCertificate
          ? "No certificate configured"
          : isUsingPlaceholder
            ? "Using development placeholder certificate"
            : "Certificates properly configured",
      },
      activeCalls: this.activeCalls.size,
      timestamp: new Date(),
    };
  }

  /**
   * Reset to primary certificate (for testing/recovery)
   */
  resetToPrimaryCertificate() {
    if (this.appCertificate) {
      this.currentCertificate = this.appCertificate;
      console.log("🔄 Reset to primary certificate");
      return true;
    }
    return false;
  }

  /**
   * Switch to backup certificate manually
   */
  switchToBackupCertificate() {
    if (this.appCertificateBackup) {
      this.currentCertificate = this.appCertificateBackup;
      console.log("🔄 Switched to backup certificate");
      return true;
    }
    return false;
  }
}

module.exports = new AgoraService();
