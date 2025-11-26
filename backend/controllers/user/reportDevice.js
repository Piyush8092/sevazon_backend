const userModel = require('../../model/userModel');

/**
 * Report Device with FCM Token
 * POST /api/user/report-device
 * 
 * Comprehensive device reporting endpoint
 * - If token exists, update timestamp
 * - If token new, insert it
 * - If deviceId changes, update record
 */
const reportDevice = async (req, res) => {
    try {
        const { userId, deviceId, fcmToken, deviceType = 'android' } = req.body;
        const timestamp = new Date();

        console.log(`📱 Device Report Received`);
        console.log(`   - userId: ${userId}`);
        console.log(`   - deviceId: ${deviceId || 'null'}`);
        console.log(`   - fcmToken: ${fcmToken ? fcmToken.substring(0, 30) + '...' : 'null'}`);
        console.log(`   - deviceType: ${deviceType}`);
        console.log(`   - timestamp: ${timestamp.toISOString()}`);

        // Validate required fields
        if (!userId) {
            console.error(`❌ User ID missing in device report`);
            return res.status(400).json({
                message: 'User ID is required',
                status: 400,
                success: false,
                error: true
            });
        }

        if (!fcmToken || fcmToken.trim() === '') {
            console.error(`❌ FCM token missing in device report for user: ${userId}`);
            return res.status(400).json({
                message: 'FCM token is required',
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

        // Check if token already exists
        const existingTokenIndex = user.fcmTokens.findIndex(t => t.token === fcmToken);

        if (existingTokenIndex !== -1) {
            // Token exists - update timestamp and deviceId if changed
            const oldDeviceId = user.fcmTokens[existingTokenIndex].deviceId;
            user.fcmTokens[existingTokenIndex].lastUsed = timestamp;
            user.fcmTokens[existingTokenIndex].updatedAt = timestamp;
            
            if (deviceId && oldDeviceId !== deviceId) {
                console.log(`🔄 Device ID changed for existing token`);
                console.log(`   - Old deviceId: ${oldDeviceId || 'null'}`);
                console.log(`   - New deviceId: ${deviceId}`);
                user.fcmTokens[existingTokenIndex].deviceId = deviceId;
            }
            
            if (deviceType) {
                user.fcmTokens[existingTokenIndex].deviceType = deviceType;
            }

            console.log(`✅ Token exists - Updated timestamp`);
            console.log(`   - User: ${userId}`);
            console.log(`   - Device: ${user.fcmTokens[existingTokenIndex].deviceId || 'null'}`);
            console.log(`   - Updated: ${timestamp.toISOString()}`);
        } else {
            // Check if device already has a different token
            const existingDeviceIndex = deviceId ? user.fcmTokens.findIndex(t => t.deviceId === deviceId) : -1;
            
            if (existingDeviceIndex !== -1) {
                // Replace old token for this device
                console.log(`🔄 Device has different token - Replacing`);
                console.log(`   - Device: ${deviceId}`);
                console.log(`   - Old token: ${user.fcmTokens[existingDeviceIndex].token.substring(0, 30)}...`);
                console.log(`   - New token: ${fcmToken.substring(0, 30)}...`);
                
                user.fcmTokens[existingDeviceIndex] = {
                    token: fcmToken,
                    deviceId: deviceId,
                    deviceType: deviceType,
                    addedAt: timestamp,
                    lastUsed: timestamp,
                    updatedAt: timestamp
                };
            } else {
                // Insert new token
                user.fcmTokens.push({
                    token: fcmToken,
                    deviceId: deviceId || null,
                    deviceType: deviceType,
                    addedAt: timestamp,
                    lastUsed: timestamp,
                    updatedAt: timestamp
                });

                console.log(`✅ New token inserted`);
                console.log(`   - User: ${userId}`);
                console.log(`   - Token: ${fcmToken.substring(0, 30)}...`);
                console.log(`   - Device: ${deviceId || 'null'}`);
                console.log(`   - Type: ${deviceType}`);
                console.log(`   - Timestamp: ${timestamp.toISOString()}`);
            }
        }

        // Save user
        await user.save();

        console.log(`📊 Device report processed - User ${userId} now has ${user.fcmTokens.length} token(s)`);

        res.json({
            message: 'Device reported successfully',
            status: 200,
            data: {
                userId: user._id,
                tokenCount: user.fcmTokens.length,
                reportedDevice: {
                    deviceId: deviceId || null,
                    deviceType: deviceType,
                    tokenPreview: fcmToken.substring(0, 30) + '...',
                    timestamp: timestamp
                }
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error(`❌ Error processing device report:`, error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { reportDevice };

