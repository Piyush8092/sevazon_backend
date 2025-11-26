const userModel = require('../../model/userModel');

/**
 * Remove FCM Token for User
 * DELETE /api/user/remove-fcm-token
 * 
 * Removes FCM token from user's fcmTokens array
 * - Can remove by token or deviceId
 * - Used for logout or token invalidation
 */
const removeFcmToken = async (req, res) => {
    try {
        const { fcmToken, deviceId } = req.body;
        const userId = req.user._id;

        console.log(`🗑️ FCM Token Removal Request - User: ${userId}, Device: ${deviceId || 'unknown'}`);

        // Validate that at least one identifier is provided
        if (!fcmToken && !deviceId) {
            console.error(`❌ Token removal failed - no token or deviceId provided for user: ${userId}`);
            return res.status(400).json({
                message: 'Either fcmToken or deviceId is required',
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

        const initialTokenCount = user.fcmTokens.length;

        // Remove token based on provided identifier
        if (fcmToken) {
            user.fcmTokens = user.fcmTokens.filter(t => t.token !== fcmToken);
        } else if (deviceId) {
            user.fcmTokens = user.fcmTokens.filter(t => t.deviceId !== deviceId);
        }

        const removedCount = initialTokenCount - user.fcmTokens.length;

        if (removedCount === 0) {
            console.log(`⚠️ No FCM token found to remove for user: ${userId}`);
            return res.status(404).json({
                message: 'FCM token not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Save user
        await user.save();

        console.log(`✅ Removed ${removedCount} FCM token(s) for user: ${userId} - Remaining tokens: ${user.fcmTokens.length}`);

        res.json({
            message: 'FCM token removed successfully',
            status: 200,
            data: {
                userId: user._id,
                removedCount: removedCount,
                remainingTokens: user.fcmTokens.length
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error(`❌ Error removing FCM token for user ${req.user?._id}:`, error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = { removeFcmToken };

