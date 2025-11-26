const userModel = require('../../model/userModel');

/**
 * Update FCM Token for User
 * POST /api/user/update-fcm-token
 * 
 * Adds or updates FCM token in user's fcmTokens array
 * - Avoids duplicates
 * - Removes null/undefined/empty tokens
 * - Updates lastUsed timestamp for existing tokens
 * - Supports multiple devices per user
 */
const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken, deviceId, deviceType = 'android' } = req.body;
        const userId = req.user._id;
        const timestamp = new Date().toISOString();

        console.log(`📥 FCM Token Registration Request`);
        console.log(`   - userId: ${userId}`);
        console.log(`   - token: ${fcmToken ? fcmToken.substring(0, 30) + '...' : 'null'}`);
        console.log(`   - deviceId: ${deviceId || 'null'}`);
        console.log(`   - deviceType: ${deviceType}`);
        console.log(`   - timestamp: ${timestamp}`);

        // Validate required fields
        if (!fcmToken || fcmToken.trim() === '') {
            console.error(`❌ FCM token missing for user: ${userId}`);
            return res.status(400).json({
                message: 'FCM token is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate device type
        const validDeviceTypes = ['android', 'ios', 'web'];
        if (!validDeviceTypes.includes(deviceType)) {
            console.error(`❌ Invalid device type for user: ${userId} - ${deviceType}`);
            return res.status(400).json({
                message: 'Invalid device type. Must be one of: android, ios, web',
                status: 400,
                success: false,
                error: true
            });
        }

        // Find user
        const user = await userModel.findById(userId);
        if (!user) {
            console.error(`❌ User not found: ${userId}`);
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Initialize fcmTokens array if it doesn't exist
        if (!user.fcmTokens) {
            user.fcmTokens = [];
        }

        // Remove any null, undefined, or empty tokens
        user.fcmTokens = user.fcmTokens.filter(t => t && t.token && t.token.trim() !== '');

        // Check if token already exists for this user
        const existingTokenIndex = user.fcmTokens.findIndex(t => t.token === fcmToken);

        if (existingTokenIndex !== -1) {
            // Token exists - update timestamps and device info
            const now = new Date();
            user.fcmTokens[existingTokenIndex].lastUsed = now;
            user.fcmTokens[existingTokenIndex].updatedAt = now;
            user.fcmTokens[existingTokenIndex].deviceId = deviceId || user.fcmTokens[existingTokenIndex].deviceId;
            user.fcmTokens[existingTokenIndex].deviceType = deviceType;

            console.log(`✅ FCM token updated (existing token)`);
            console.log(`   - User: ${userId}`);
            console.log(`   - Device: ${deviceId || 'null'}`);
            console.log(`   - Updated timestamp: ${now.toISOString()}`);
            console.log(`   - Total tokens: ${user.fcmTokens.length}`);
        } else {
            // Check if this device already has a different token
            const existingDeviceIndex = deviceId ? user.fcmTokens.findIndex(t => t.deviceId === deviceId) : -1;

            if (existingDeviceIndex !== -1) {
                // Replace old token for this device
                const now = new Date();
                console.log(`🔄 Replacing old token for device: ${deviceId}`);
                user.fcmTokens[existingDeviceIndex] = {
                    token: fcmToken,
                    deviceId: deviceId,
                    deviceType: deviceType,
                    addedAt: now,
                    lastUsed: now,
                    updatedAt: now
                };
                console.log(`   - New token registered: ${fcmToken.substring(0, 30)}...`);
                console.log(`   - Timestamp: ${now.toISOString()}`);
            } else {
                // Add new token
                const now = new Date();
                user.fcmTokens.push({
                    token: fcmToken,
                    deviceId: deviceId || null,
                    deviceType: deviceType,
                    addedAt: now,
                    lastUsed: now,
                    updatedAt: now
                });
                console.log(`✅ New FCM token registered`);
                console.log(`   - User: ${userId}`);
                console.log(`   - Token: ${fcmToken.substring(0, 30)}...`);
                console.log(`   - Device: ${deviceId || 'null'}`);
                console.log(`   - Type: ${deviceType}`);
                console.log(`   - Timestamp: ${now.toISOString()}`);
            }
        }

        // Save user
        await user.save();

        console.log(`📱 User ${userId} now has ${user.fcmTokens.length} active FCM token(s)`);

        res.json({
            message: 'FCM token updated successfully',
            status: 200,
            data: {
                userId: user._id,
                tokenCount: user.fcmTokens.length,
                tokens: user.fcmTokens.map(t => ({
                    deviceId: t.deviceId,
                    deviceType: t.deviceType,
                    addedAt: t.addedAt,
                    lastUsed: t.lastUsed,
                    updatedAt: t.updatedAt
                }))
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error(`❌ Error updating FCM token for user ${req.user?._id}:`, error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { updateFcmToken };

