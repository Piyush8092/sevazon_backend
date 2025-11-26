const user = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LoginRout = async (req, res) => {
    try {
        let payload = req.body;
        if ((!payload.email && !payload.phone) || !payload.password) {
            return res.status(400).json({ message: 'Password and at least one of email or phone are required' });
        }
        
        let existingUser = null;
        
        if(payload.email){
            existingUser = await user.findOne({ email: payload.email });
            if (!existingUser) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        }
        
        if(payload.phone && !existingUser){
            existingUser = await user.findOne({ phone: payload.phone });
            if (!existingUser) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
        }
  
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(payload.password, existingUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        let token = jwt.sign(
            { id: existingUser._id },
            process.env.SECRET_KEY || 'me333enneffiimsqoqomcngfehdj3idss',
            { expiresIn: '1d' }
        );

        // ✅ Fix here
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: true,          // Render pe hamesha https hota hai → true rakho
            sameSite: "none",      // Cross-origin ke liye zaruri
            maxAge: 365*24*60*60*1000 // 1 saal (ms me)
        });

        existingUser.token = token;
        //afetr login strore last login time and date
        existingUser.LastLoginTime = new Date();

        // Handle FCM token if provided in request body
        const { fcmToken, deviceId, deviceType } = payload;
        if (fcmToken && deviceId) {
            console.log(`📥 FCM Token provided during login - User: ${existingUser._id}, Device: ${deviceId}`);

            // Initialize fcmTokens array if it doesn't exist
            if (!existingUser.fcmTokens) {
                existingUser.fcmTokens = [];
            }

            // Remove any null, undefined, or empty tokens
            existingUser.fcmTokens = existingUser.fcmTokens.filter(t => t && t.token && t.token.trim() !== '');

            // Check if token already exists
            const existingTokenIndex = existingUser.fcmTokens.findIndex(t => t.token === fcmToken);

            if (existingTokenIndex !== -1) {
                // Update existing token
                existingUser.fcmTokens[existingTokenIndex].lastUsed = new Date();
                existingUser.fcmTokens[existingTokenIndex].deviceId = deviceId;
                if (deviceType) {
                    existingUser.fcmTokens[existingTokenIndex].deviceType = deviceType;
                }
                console.log(`✅ FCM token updated during login for user: ${existingUser._id}`);
            } else {
                // Check if device already has a different token
                const existingDeviceIndex = existingUser.fcmTokens.findIndex(t => t.deviceId === deviceId);

                if (existingDeviceIndex !== -1) {
                    // Replace old token for this device
                    console.log(`🔄 Replacing old FCM token for device: ${deviceId}`);
                    existingUser.fcmTokens[existingDeviceIndex] = {
                        token: fcmToken,
                        deviceId: deviceId,
                        deviceType: deviceType || 'android',
                        addedAt: new Date(),
                        lastUsed: new Date()
                    };
                } else {
                    // Add new token
                    existingUser.fcmTokens.push({
                        token: fcmToken,
                        deviceId: deviceId,
                        deviceType: deviceType || 'android',
                        addedAt: new Date(),
                        lastUsed: new Date()
                    });
                    console.log(`✅ Saving FCM token during login for user ${existingUser._id} - Device: ${deviceId}, Total tokens: ${existingUser.fcmTokens.length}`);
                }
            }

            console.log(`📱 User ${existingUser._id} has ${existingUser.fcmTokens.length} active FCM token(s) after login`);
        }

        await existingUser.save();
        res.json({ message: 'Login successful', status: 200, data: existingUser, success: true, error: false });
    } catch (e) {
        res.json({ message: 'Something went wrong', status: 500, data: e, success: false, error: true });
    }
};

module.exports = { LoginRout };
