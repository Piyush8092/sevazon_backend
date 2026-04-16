const { getMessaging } = require("../config/firebase");
const FCMToken = require("../model/fcmTokenModel");
const NotificationHistory = require("../model/notificationHistoryModel");
const NotificationPreferences = require("../model/notificationPreferencesModel");
const User = require("../model/userModel");
const crypto = require("crypto");

// Helper function to generate UUID v4
const uuidv4 = () => {
  return crypto.randomUUID();
};

class NotificationService {
  constructor() {
    this.messaging = null;
    this.initializeMessaging();
  }

  async initializeMessaging() {
    try {
      this.messaging = getMessaging();
    } catch (error) {
      console.error("Failed to initialize FCM messaging:", error);
    }
  }

  // Create notification payload
  createNotificationPayload(title, body, data = {}, options = {}) {
    // CRITICAL FIX: Convert all data values to strings
    // FCM requires data payload to only contain string values
    const stringifiedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        stringifiedData[key] = "";
      } else if (typeof value === "object") {
        stringifiedData[key] = JSON.stringify(value);
      } else {
        stringifiedData[key] = String(value);
      }
    }

    const payload = {
      notification: {
        title,
        body,
      },
      data: {
        ...stringifiedData,
        timestamp: Date.now().toString(),
      },
    };

    // Add Android-specific options
    if (options.android) {
      payload.android = {
        priority: options.android.priority || options.priority || "high",
        ...(options.android.notification && {
          notification: {
            sound: options.android.notification.sound || options.sound || "default",
            channelId: options.android.notification.channelId || options.channelId || "default",
            ...options.android.notification,
          },
        }),
      };
    }

    // Add iOS-specific options
    if (options.ios) {
      payload.apns = {
        payload: {
          aps: {
            sound: options.sound || "default",
            badge: options.badge,
            ...options.ios,
          },
        },
      };
    }

    // Add web-specific options
    if (options.web) {
      payload.webpush = {
        notification: {
          icon: options.icon,
          badge: options.badge,
          ...options.web,
        },
      };
    }

    return payload;
  }

  // Send notification to a single user
  async sendToUser(userId, title, body, data = {}, options = {}) {
    try {
      // Validate userId
      if (!userId || userId === "unknown") {
        console.error(`❌ Invalid userId provided to sendToUser: ${userId}`);
        return { success: false, reason: "invalid_user_id", error: "Invalid or missing userId" };
      }

      // Check user preferences
      const preferences = await NotificationPreferences.findOrCreateForUser(userId);
      const category = options.category || "system";
      const type = options.type || "general";

      if (!preferences.shouldSendNotification(category, type)) {
        console.log(`⚠️ Notification blocked by user preferences: ${userId}, ${category}, ${type}`);
        return { success: false, reason: "blocked_by_preferences" };
      }

      // Get user's FCM tokens from user document
      console.log(`🔍 Attempting notification to user ${userId}`);
      console.log(`   - Notification type: ${type}`);
      console.log(`   - Title: ${title}`);

      const user = await User.findById(userId).select("fcmTokens name email phone");

      if (!user) {
        console.error(`❌ User not found: ${userId}`);
        console.error(`   ⚠️ Cannot send notification - user does not exist`);
        return { success: false, reason: "user_not_found", error: "User not found" };
      }

      console.log(`✅ User found: ${user.name || "N/A"} (${user.email || user.phone || "N/A"})`);

      // Get valid tokens – merge from embedded user.fcmTokens AND FCMToken collection
      let tokens = [];
      let tokenDetails = [];
      const seenTokens = new Set();

      // 1. Embedded tokens stored directly on the user document (added during login)
      if (user.fcmTokens && Array.isArray(user.fcmTokens)) {
        const validEmbedded = user.fcmTokens.filter((t) => t && t.token && t.token.trim() !== "");
        for (const t of validEmbedded) {
          if (!seenTokens.has(t.token)) {
            seenTokens.add(t.token);
            tokens.push(t.token);
            tokenDetails.push({
              token: t.token,
              deviceId: t.deviceId,
              deviceType: t.deviceType,
              lastUsed: t.lastUsed,
              fcmTokenId: null,
            });
          }
        }
      }

      // 2. Tokens registered via /fcm/register endpoint (stored in FCMToken collection)
      try {
        const collectionTokens = await FCMToken.findActiveTokensForUser(userId);
        for (const ct of collectionTokens) {
          if (!seenTokens.has(ct.token)) {
            seenTokens.add(ct.token);
            tokens.push(ct.token);
            tokenDetails.push({
              token: ct.token,
              deviceId: ct.deviceInfo?.deviceId,
              deviceType: ct.deviceInfo?.deviceType,
              lastUsed: ct.lastUsed,
              fcmTokenId: ct._id,
            });
          }
        }
      } catch (mergeErr) {
        console.warn(
          `⚠️ Could not merge FCMToken collection for user ${userId}:`,
          mergeErr.message
        );
      }

      console.log(`📊 Tokens available: ${tokens.length}`);

      if (!tokens || tokens.length === 0) {
        console.error(`❌ No active FCM tokens found for user: ${userId}`);
        console.error(`   - Notification type: ${type}`);
        console.error(`   - User: ${user.name || "N/A"} (${user.email || user.phone || "N/A"})`);
        console.error(`   ⚠️ No valid tokens → notify client to re-register`);
        console.error(`   ⚠️ User needs to login/refresh app to register FCM token`);
        return { success: false, reason: "no_tokens", error: "No active FCM tokens found" };
      }

      console.log(`📨 Sending ${type} notification to ${tokens.length} device(s)`);
      tokenDetails.forEach((td, index) => {
        console.log(
          `   ${index + 1}. Device: ${td.deviceType || "unknown"} (${td.deviceId || "unknown"})`
        );
        console.log(`      Token: ${td.token.substring(0, 30)}...`);
        console.log(
          `      Last used: ${td.lastUsed ? new Date(td.lastUsed).toISOString() : "N/A"}`
        );
      });

      const results = [];
      const batchId = uuidv4();
      const invalidTokens = [];
      let failureCount = 0;

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const tokenDetail = tokenDetails[i];

        console.log(`📤 Sending to token ${i + 1}/${tokens.length}: ${token.substring(0, 30)}...`);

        const result = await this.sendToToken(token, title, body, data, {
          ...options,
          userId,
          fcmTokenId: tokenDetail.fcmTokenId || null,
          batchId,
          deviceId: tokenDetail.deviceId,
          deviceType: tokenDetail.deviceType,
        });

        results.push(result);

        if (result.success) {
          console.log(`   ✅ Sent successfully to ${tokenDetail.deviceType || "unknown"} device`);
        } else {
          failureCount += 1;
          console.error(`   ❌ Failed to send to ${tokenDetail.deviceType || "unknown"} device`);
          console.error(`      Error: ${result.error}`);
          if (result.code) {
            console.error(`      Code: ${result.code}`);
          }

          // Check if token is invalid
          if (this.isInvalidTokenError({ code: result.code, message: result.error })) {
            console.error(`   🗑️ Token invalid → marking for removal`);
            invalidTokens.push(token);
          }
        }
      }

      // Remove invalid tokens from both the embedded user array and the FCMToken collection
      if (invalidTokens.length > 0) {
        console.log(`🗑️ Removing ${invalidTokens.length} invalid token(s) from user ${userId}`);
        try {
          // 1. Remove from user.fcmTokens embedded array
          await User.findByIdAndUpdate(userId, {
            $pull: { fcmTokens: { token: { $in: invalidTokens } } },
          });
          // 2. Deactivate in FCMToken collection (registered via /fcm/register)
          await FCMToken.updateMany(
            { token: { $in: invalidTokens } },
            { $set: { isActive: false } }
          );
          console.log(`   ✅ Invalid tokens removed from embedded array and FCMToken collection`);
        } catch (removeErr) {
          console.error(`   ❌ Failed to remove invalid tokens:`, removeErr.message);
        }
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(
        `📊 Notification batch complete: ${successCount} success, ${failureCount} failed, ${invalidTokens.length} invalid removed (total ${tokens.length})`
      );

      return {
        success: successCount > 0,
        results,
        totalTokens: tokens.length,
        successCount: successCount,
        failureCount,
        invalidTokensRemoved: invalidTokens.length,
      };
    } catch (error) {
      console.error("Error sending notification to user:", error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to a specific FCM token
  async sendToToken(token, title, body, data = {}, options = {}) {
    try {
      if (!this.messaging) {
        await this.initializeMessaging();
      }

      const payload = this.createNotificationPayload(title, body, data, options);
      payload.token = token;

      // Create notification history record
      const historyRecord = new NotificationHistory({
        userId: options.userId,
        fcmTokenId: options.fcmTokenId,
        title,
        body,
        data,
        category: options.category || "system",
        type: options.type || "general",
        priority: options.priority || "normal",
        batchId: options.batchId,
        relatedEntity: options.relatedEntity,
        senderId: options.senderId,
        scheduledAt: new Date(),
      });

      await historyRecord.save();

      // Send notification
      const response = await this.messaging.send(payload);

      // Update history record with success
      await historyRecord.markAsSent({
        messageId: response,
        success: true,
      });

      // Update token delivery stats
      if (options.fcmTokenId) {
        const tokenDoc = await FCMToken.findById(options.fcmTokenId);
        if (tokenDoc) {
          await tokenDoc.updateDeliveryStats(true);
        }
      }

      return {
        success: true,
        messageId: response,
        historyId: historyRecord._id,
      };
    } catch (error) {
      console.error("Error sending notification to token:", error);

      // Update history record with failure
      if (options.fcmTokenId) {
        try {
          const historyRecord = await NotificationHistory.findOne({
            fcmTokenId: options.fcmTokenId,
            status: "pending",
          }).sort({ createdAt: -1 });

          if (historyRecord) {
            await historyRecord.markAsFailed(error);
          }

          // Update token delivery stats
          const tokenDoc = await FCMToken.findById(options.fcmTokenId);
          if (tokenDoc) {
            await tokenDoc.updateDeliveryStats(false);
          }

          // Handle invalid token errors (guard against null tokenDoc)
          if (this.isInvalidTokenError(error) && tokenDoc) {
            await tokenDoc.deactivate();
            console.log(
              `🗑️ Deactivated invalid FCM token in collection: ${token.substring(0, 30)}...`
            );
          }
        } catch (updateError) {
          console.error("Error updating failure record:", updateError);
        }
      }

      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  // Send notification to multiple users
  async sendToMultipleUsers(userIds, title, body, data = {}, options = {}) {
    try {
      const results = [];
      const batchId = uuidv4();

      for (const userId of userIds) {
        const result = await this.sendToUser(userId, title, body, data, { ...options, batchId });
        results.push({ userId, ...result });
      }

      return {
        success: true,
        batchId,
        results,
        totalUsers: userIds.length,
        successCount: results.filter((r) => r.success).length,
      };
    } catch (error) {
      console.error("Error sending notifications to multiple users:", error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to all users with specific criteria
  async sendBroadcast(title, body, data = {}, options = {}) {
    try {
      // BUG FIX: Previously this only fetched users who had tokens in the
      // FCMToken collection (registered via /fcm/register). But users store
      // their FCM tokens in TWO places:
      //   1. user.fcmTokens  (embedded in User doc, registered on login)
      //   2. FCMToken collection (registered via /fcm/register endpoint)
      // Users in group 1 were completely missed by the broadcast.
      //
      // Fix: query ALL users from the User collection so sendToUser() can
      // merge tokens from both sources for each person.

      // Also collect any user IDs from the FCMToken collection that may not
      // have an embedded token on their User doc.
      const userIdsFromFCMCollection = await FCMToken.distinct("userId", { isActive: true });

      // Fetch all users who have at least one embedded FCM token
      const usersWithEmbeddedTokens = await User.find(
        { "fcmTokens.0": { $exists: true } },
        { _id: 1 }
      ).lean();

      // Merge both sets, removing duplicates
      const allUserIdStrings = new Set([
        ...usersWithEmbeddedTokens.map((u) => u._id.toString()),
        ...userIdsFromFCMCollection
          .filter((id) => id != null) // guard against orphaned tokens
          .map((id) => id.toString()),
      ]);

      const userIds = [...allUserIdStrings];

      console.log(
        `📢 Broadcast: sending to ${userIds.length} users (${usersWithEmbeddedTokens.length} with embedded tokens, ${userIdsFromFCMCollection.length} in FCMToken collection)`
      );

      return await this.sendToMultipleUsers(userIds, title, body, data, options);
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Check if error indicates invalid token
  isInvalidTokenError(error) {
    const errorCode = error?.code || "";
    const errorMessage = (error?.message || error?.error || "").toString().toLowerCase();

    const invalidTokenCodes = [
      "messaging/invalid-registration-token",
      "messaging/registration-token-not-registered",
    ];

    if (invalidTokenCodes.includes(errorCode)) {
      return true;
    }

    return (
      errorMessage.includes("registration-token-not-registered") ||
      errorMessage.includes("invalid-registration-token")
    );
  }

  // Schedule notification for later delivery
  async scheduleNotification(userId, title, body, data = {}, scheduledAt, options = {}) {
    try {
      const historyRecord = new NotificationHistory({
        userId,
        title,
        body,
        data,
        category: options.category || "system",
        type: options.type || "general",
        priority: options.priority || "normal",
        scheduledAt: new Date(scheduledAt),
        relatedEntity: options.relatedEntity,
        senderId: options.senderId,
        status: "pending",
      });

      await historyRecord.save();

      return {
        success: true,
        notificationId: historyRecord._id,
        scheduledAt: historyRecord.scheduledAt,
      };
    } catch (error) {
      console.error("Error scheduling notification:", error);
      return { success: false, error: error.message };
    }
  }

  // Process scheduled notifications (to be called by a cron job)
  async processScheduledNotifications() {
    try {
      const now = new Date();
      const scheduledNotifications = await NotificationHistory.find({
        status: "pending",
        scheduledAt: { $lte: now },
      });

      const results = [];

      for (const notification of scheduledNotifications) {
        const result = await this.sendToUser(
          notification.userId,
          notification.title,
          notification.body,
          notification.data,
          {
            category: notification.category,
            type: notification.type,
            priority: notification.priority,
            relatedEntity: notification.relatedEntity,
            senderId: notification.senderId,
          }
        );

        results.push({
          notificationId: notification._id,
          ...result,
        });
      }

      return {
        success: true,
        processedCount: results.length,
        results,
      };
    } catch (error) {
      console.error("Error processing scheduled notifications:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
