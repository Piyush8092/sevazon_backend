const { RtcTokenBuilder, RtcRole } = require('agora-token');
const { v4: uuidv4 } = require('uuid');

/**
 * Agora Service for handling video/voice call functionality
 * Provides token generation, channel management, and call state tracking
 */
class AgoraService {
  constructor() {
    // Agora App ID and App Certificate from environment variables
    this.appId = process.env.AGORA_APP_ID || '400bb82ebad34539aebcb6de61e5a976';
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE;
    this.appCertificateBackup = process.env.AGORA_APP_CERTIFICATE_BACKUP;
    this.currentCertificate = this.appCertificate; // Track which certificate is currently being used

    // Token expiration time (24 hours)
    this.tokenExpirationInSeconds = 24 * 60 * 60;

    // In-memory storage for active calls (in production, use Redis or database)
    this.activeCalls = new Map();

    console.log('🎥 AgoraService initialized');
    console.log(`📱 App ID: ${this.appId}`);
    console.log(`🔐 Primary Certificate: ${this.appCertificate ? 'Configured' : 'Not configured'}`);
    console.log(`🔐 Backup Certificate: ${this.appCertificateBackup ? 'Available' : 'Not available'}`);
    console.log(`🔐 Current Certificate: ${this.currentCertificate ? 'Active' : 'None'}`);
  }

  /**
   * Generate Agora RTC token for a channel
   * @param {string} channelName - The channel name
   * @param {string} userId - The user ID
   * @param {string} role - The user role ('publisher' or 'subscriber')
   * @returns {Object} Token and channel information
   */
  generateToken(channelName, userId, role = 'publisher') {
    try {
      if (!this.currentCertificate) {
        console.warn('⚠️ No App Certificate configured, returning null token for development');
        return {
          token: null,
          channelName,
          userId,
          uid: this.generateUid(),
          expiresAt: Date.now() + (this.tokenExpirationInSeconds * 1000),
          appId: this.appId,
          certificateStatus: 'not_configured'
        };
      }

      // Convert string userId to numeric UID
      const uid = this.generateUid();

      // Determine Agora role
      const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

      // Calculate expiration time
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + this.tokenExpirationInSeconds;

      // Try to generate token with current certificate
      let token;
      let certificateUsed = 'primary';

      try {
        token = RtcTokenBuilder.buildTokenWithUid(
          this.appId,
          this.currentCertificate,
          channelName,
          uid,
          agoraRole,
          privilegeExpiredTs
        );

        console.log(`✅ Generated token with ${this.currentCertificate === this.appCertificate ? 'primary' : 'backup'} certificate`);

      } catch (tokenError) {
        console.error(`❌ Failed to generate token with ${this.currentCertificate === this.appCertificate ? 'primary' : 'backup'} certificate:`, tokenError);

        // Try fallback to backup certificate if available and not already using it
        if (this.appCertificateBackup && this.currentCertificate !== this.appCertificateBackup) {
          console.log('🔄 Attempting fallback to backup certificate...');

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
            certificateUsed = 'backup';

            console.log('✅ Successfully generated token with backup certificate');
            console.log('🔄 Switched to backup certificate for future requests');

          } catch (backupError) {
            console.error('❌ Backup certificate also failed:', backupError);
            throw new Error(`Both primary and backup certificates failed. Primary: ${tokenError.message}, Backup: ${backupError.message}`);
          }
        } else {
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
        certificateStatus: 'active'
      };
    } catch (error) {
      console.error('❌ Error generating Agora token:', error);
      throw new Error(`Failed to generate token: ${error.message}`);
    }
  }

  /**
   * Generate a random UID for Agora
   * @returns {number} Random UID
   */
  generateUid() {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  /**
   * Generate a unique channel name
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {string} Unique channel name
   */
  generateChannelName(userId1, userId2) {
    // Sort user IDs to ensure consistent channel names
    const sortedIds = [userId1, userId2].sort();
    return `call_${sortedIds[0]}_${sortedIds[1]}_${Date.now()}`;
  }

  /**
   * Initiate a call between two users
   * @param {string} callerId - The caller's user ID
   * @param {string} calleeId - The callee's user ID
   * @param {string} callType - 'voice' or 'video'
   * @returns {Object} Call information
   */
  initiateCall(callerId, calleeId, callType = 'voice') {
    try {
      const callId = uuidv4();
      const channelName = this.generateChannelName(callerId, calleeId);
      
      // Generate tokens for both users
      const callerToken = this.generateToken(channelName, callerId, 'publisher');
      const calleeToken = this.generateToken(channelName, calleeId, 'publisher');
      
      const callData = {
        callId,
        channelName,
        callType,
        status: 'initiated',
        caller: {
          userId: callerId,
          ...callerToken
        },
        callee: {
          userId: calleeId,
          ...calleeToken
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store call data
      this.activeCalls.set(callId, callData);
      
      console.log(`📞 Call initiated: ${callId} (${callType}) from ${callerId} to ${calleeId}`);
      
      return callData;
    } catch (error) {
      console.error('❌ Error initiating call:', error);
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
      const call = this.activeCalls.get(callId);
      if (!call) {
        throw new Error('Call not found');
      }
      
      if (call.callee.userId !== userId) {
        throw new Error('Unauthorized to answer this call');
      }
      
      call.status = 'active';
      call.answeredAt = new Date();
      call.updatedAt = new Date();
      
      this.activeCalls.set(callId, call);
      
      console.log(`✅ Call answered: ${callId} by ${userId}`);
      
      return call;
    } catch (error) {
      console.error('❌ Error answering call:', error);
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
      const call = this.activeCalls.get(callId);
      if (!call) {
        throw new Error('Call not found');
      }
      
      // Allow either participant to end the call
      if (call.caller.userId !== userId && call.callee.userId !== userId) {
        throw new Error('Unauthorized to end this call');
      }
      
      call.status = 'ended';
      call.endedAt = new Date();
      call.endedBy = userId;
      call.updatedAt = new Date();
      
      // Calculate call duration if it was active
      if (call.answeredAt) {
        call.duration = Math.floor((call.endedAt - call.answeredAt) / 1000); // in seconds
      }
      
      this.activeCalls.set(callId, call);
      
      console.log(`📴 Call ended: ${callId} by ${userId}`);
      
      // Remove from active calls after a delay (for cleanup)
      setTimeout(() => {
        this.activeCalls.delete(callId);
        console.log(`🗑️ Call ${callId} removed from active calls`);
      }, 60000); // 1 minute delay
      
      return call;
    } catch (error) {
      console.error('❌ Error ending call:', error);
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
      throw new Error('Call not found');
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
      if ((call.caller.userId === userId || call.callee.userId === userId) && 
          call.status !== 'ended') {
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
      const call = this.activeCalls.get(callId);
      if (!call) {
        throw new Error('Call not found');
      }
      
      if (call.callee.userId !== userId) {
        throw new Error('Unauthorized to decline this call');
      }
      
      call.status = 'declined';
      call.declinedAt = new Date();
      call.updatedAt = new Date();
      
      this.activeCalls.set(callId, call);
      
      console.log(`❌ Call declined: ${callId} by ${userId}`);
      
      return call;
    } catch (error) {
      console.error('❌ Error declining call:', error);
      throw new Error(`Failed to decline call: ${error.message}`);
    }
  }

  /**
   * Get service health status
   * @returns {Object} Service status
   */
  getStatus() {
    return {
      status: 'healthy',
      appId: this.appId,
      certificates: {
        primary: {
          configured: !!this.appCertificate,
          value: this.appCertificate ? `${this.appCertificate.substring(0, 8)}...` : null
        },
        backup: {
          configured: !!this.appCertificateBackup,
          value: this.appCertificateBackup ? `${this.appCertificateBackup.substring(0, 8)}...` : null
        },
        currentlyUsing: this.currentCertificate === this.appCertificate ? 'primary' :
                       this.currentCertificate === this.appCertificateBackup ? 'backup' : 'none'
      },
      activeCalls: this.activeCalls.size,
      timestamp: new Date()
    };
  }

  /**
   * Reset to primary certificate (for testing/recovery)
   */
  resetToPrimaryCertificate() {
    if (this.appCertificate) {
      this.currentCertificate = this.appCertificate;
      console.log('🔄 Reset to primary certificate');
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
      console.log('🔄 Switched to backup certificate');
      return true;
    }
    return false;
  }
}

module.exports = new AgoraService();
