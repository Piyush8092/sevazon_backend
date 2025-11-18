const FCMToken = require('../../model/fcmTokenModel');
const { isValidFCMToken } = require('../../config/firebase');

// Register or update FCM token
const registerToken = async (req, res) => {
    try {
        const { token, deviceInfo } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!token) {
            return res.status(400).json({
                message: 'FCM token is required',
                status: 400,
                success: false,
                error: true
            });
        }

        if (!deviceInfo || !deviceInfo.deviceId || !deviceInfo.deviceType) {
            return res.status(400).json({
                message: 'Device information (deviceId and deviceType) is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate FCM token format
        if (!isValidFCMToken(token)) {
            return res.status(400).json({
                message: 'Invalid FCM token format',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate device type
        const validDeviceTypes = ['android', 'ios', 'web'];
        if (!validDeviceTypes.includes(deviceInfo.deviceType)) {
            return res.status(400).json({
                message: 'Invalid device type. Must be one of: android, ios, web',
                status: 400,
                success: false,
                error: true
            });
        }

        // Check if token already exists
        let existingToken = await FCMToken.findOne({ token });

        if (existingToken) {
            // If token exists but for different user, deactivate old and create new
            if (existingToken.userId.toString() !== userId.toString()) {
                await existingToken.deactivate();
                existingToken = null;
            } else {
                // Update existing token
                existingToken.deviceInfo = deviceInfo;
                existingToken.isActive = true;
                existingToken.lastUsed = new Date();
                await existingToken.save();

                return res.json({
                    message: 'FCM token updated successfully',
                    status: 200,
                    data: existingToken,
                    success: true,
                    error: false
                });
            }
        }

        // Check for existing token with same device ID for this user
        const existingDeviceToken = await FCMToken.findOne({
            userId,
            'deviceInfo.deviceId': deviceInfo.deviceId,
            isActive: true
        });

        if (existingDeviceToken && existingDeviceToken.token !== token) {
            // Store old token in history before updating
            existingDeviceToken.tokenHistory.push({
                oldToken: existingDeviceToken.token,
                updatedAt: new Date()
            });
            
            existingDeviceToken.token = token;
            existingDeviceToken.deviceInfo = deviceInfo;
            existingDeviceToken.lastUsed = new Date();
            await existingDeviceToken.save();

            return res.json({
                message: 'FCM token updated for existing device',
                status: 200,
                data: existingDeviceToken,
                success: true,
                error: false
            });
        }

        // Create new token record
        const newToken = new FCMToken({
            userId,
            token,
            deviceInfo
        });

        await newToken.save();

        res.json({
            message: 'FCM token registered successfully',
            status: 200,
            data: newToken,
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error registering FCM token:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'FCM token already exists',
                status: 409,
                success: false,
                error: true
            });
        }

        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

// Remove FCM token (for logout)
const removeToken = async (req, res) => {
    try {
        const { token, deviceId } = req.body;
        const userId = req.user._id;

        let query = { userId, isActive: true };

        if (token) {
            query.token = token;
        } else if (deviceId) {
            query['deviceInfo.deviceId'] = deviceId;
        } else {
            return res.status(400).json({
                message: 'Either token or deviceId is required',
                status: 400,
                success: false,
                error: true
            });
        }

        const fcmToken = await FCMToken.findOne(query);

        if (!fcmToken) {
            return res.status(404).json({
                message: 'FCM token not found',
                status: 404,
                success: false,
                error: true
            });
        }

        await fcmToken.deactivate();

        res.json({
            message: 'FCM token removed successfully',
            status: 200,
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error removing FCM token:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

// Get user's active FCM tokens
const getUserTokens = async (req, res) => {
    try {
        const userId = req.user._id;

        const tokens = await FCMToken.findActiveTokensForUser(userId);

        res.json({
            message: 'FCM tokens retrieved successfully',
            status: 200,
            data: tokens,
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error retrieving FCM tokens:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

// Validate FCM token
const validateToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: 'FCM token is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Check token format
        const isValidFormat = isValidFCMToken(token);
        
        // Check if token exists in database
        const existingToken = await FCMToken.findOne({ token, isActive: true });

        res.json({
            message: 'Token validation completed',
            status: 200,
            data: {
                isValidFormat,
                existsInDatabase: !!existingToken,
                isValid: isValidFormat && !!existingToken
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error validating FCM token:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

// Cleanup inactive tokens (admin endpoint)
const cleanupTokens = async (req, res) => {
    try {
        const { daysOld = 30 } = req.query;

        const result = await FCMToken.cleanupOldTokens(parseInt(daysOld));

        res.json({
            message: 'Token cleanup completed',
            status: 200,
            data: {
                deletedCount: result.deletedCount
            },
            success: true,
            error: false
        });

    } catch (error) {
        console.error('Error cleaning up FCM tokens:', error);
        res.status(500).json({
            message: 'Internal server error',
            status: 500,
            data: error.message,
            success: false,
            error: true
        });
    }
};

module.exports = {
    registerToken,
    removeToken,
    getUserTokens,
    validateToken,
    cleanupTokens
};
