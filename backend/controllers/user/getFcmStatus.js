const userModel = require('../../model/userModel');

/**
 * Get FCM Token Status for User
 * GET /api/user/fcm-status/:userId
 * 
 * Returns comprehensive FCM token information for diagnostics
 * - Total token count
 * - List of all tokens with metadata
 * - Last updated timestamp
 * - Device mapping
 */
const getFcmStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`🔍 FCM Status Request for user: ${userId}`);

        // Validate userId
        if (!userId) {
            console.error(`❌ User ID missing in request`);
            return res.status(400).json({
                message: 'User ID is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Find user
        const user = await userModel.findById(userId).select('fcmTokens name email phone');
        if (!user) {
            console.error(`❌ User not found: ${userId}`);
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Get FCM tokens
        const fcmTokens = user.fcmTokens || [];
        
        // Filter valid tokens
        const validTokens = fcmTokens.filter(t => t && t.token && t.token.trim() !== '');
        
        // Calculate last updated
        let lastUpdated = null;
        if (validTokens.length > 0) {
            const timestamps = validTokens.map(t => new Date(t.updatedAt || t.lastUsed || t.addedAt));
            lastUpdated = new Date(Math.max(...timestamps));
        }

        // Create device mapping
        const deviceMapping = validTokens.map(t => ({
            deviceId: t.deviceId || 'unknown',
            deviceType: t.deviceType || 'unknown',
            tokenPreview: t.token ? t.token.substring(0, 30) + '...' : 'invalid',
            addedAt: t.addedAt,
            lastUsed: t.lastUsed,
            updatedAt: t.updatedAt
        }));

        // Log status
        console.log(`📊 FCM Status for user ${userId}:`);
        console.log(`   - Name: ${user.name || 'N/A'}`);
        console.log(`   - Email: ${user.email || 'N/A'}`);
        console.log(`   - Phone: ${user.phone || 'N/A'}`);
        console.log(`   - Total tokens: ${validTokens.length}`);
        console.log(`   - Last updated: ${lastUpdated ? lastUpdated.toISOString() : 'Never'}`);
        console.log(`   - Devices:`);
        deviceMapping.forEach((device, index) => {
            console.log(`     ${index + 1}. ${device.deviceType} (${device.deviceId})`);
            console.log(`        Token: ${device.tokenPreview}`);
            console.log(`        Added: ${device.addedAt ? new Date(device.addedAt).toISOString() : 'N/A'}`);
            console.log(`        Last used: ${device.lastUsed ? new Date(device.lastUsed).toISOString() : 'N/A'}`);
        });

        res.json({
            message: 'FCM status retrieved successfully',
            status: 200,
            data: {
                userId: user._id,
                userName: user.name || 'N/A',
                userEmail: user.email || 'N/A',
                userPhone: user.phone || 'N/A',
                totalTokens: validTokens.length,
                lastUpdated: lastUpdated,
                tokens: validTokens.map(t => ({
                    tokenPreview: t.token ? t.token.substring(0, 30) + '...' : 'invalid',
                    deviceId: t.deviceId || null,
                    deviceType: t.deviceType || 'unknown',
                    addedAt: t.addedAt,
                    lastUsed: t.lastUsed,
                    updatedAt: t.updatedAt
                })),
                deviceMapping: deviceMapping
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error(`❌ Error getting FCM status for user ${req.params.userId}:`, error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getFcmStatus };

