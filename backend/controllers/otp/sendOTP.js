let otpModel = require('../../model/otpModel');
const fast2smsService = require('../../services/fast2smsService');

const sendOTP = async (req, res) => {
    try {
        let payload = req.body;

        // Validate phone number
        if (!payload.phone) {
            return res.status(400).json({
                message: 'Phone number is required',
                status: 400,
                success: false,
                error: true
            });
        }

        console.log(`📱 OTP request for phone: ${payload.phone}`);

        // Generate OTP if not provided (auto-generate for better security)
        const otp = payload.otp || fast2smsService.generateOTP();

        console.log(`🔐 Generated OTP: ${otp} for ${payload.phone}`);

        // Check if OTP already exists for this phone number and delete it
        const existingOTP = await otpModel.findOne({ phone: payload.phone });
        if (existingOTP) {
            await otpModel.deleteOne({ phone: payload.phone });
            console.log(`🗑️ Deleted existing OTP for ${payload.phone}`);
        }

        // Send OTP via Fast2SMS
        const smsResult = await fast2smsService.sendOTP(payload.phone, otp);

        if (!smsResult.success) {
            console.error(`❌ Failed to send SMS: ${smsResult.message}`);
            return res.status(500).json({
                message: smsResult.message || 'Failed to send OTP',
                status: 500,
                success: false,
                error: true,
                details: smsResult.error
            });
        }

        console.log(`✅ SMS sent successfully via Fast2SMS`);

        // Save OTP to database
        const newOTP = new otpModel({
            phone: payload.phone,
            otp: otp
        });

        const result = await newOTP.save();
        console.log(`💾 OTP saved to database for ${payload.phone}`);

        // Return success response (don't send OTP in response for security)
        res.json({
            message: 'OTP sent successfully to your phone number',
            status: 200,
            data: {
                phone: payload.phone,
                expiresIn: '5 minutes',
                // Only include OTP in development mode for testing
                ...(process.env.NODE_ENV === 'development' && { otp: otp })
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('❌ Error in sendOTP:', e);
        res.status(500).json({
            message: 'Something went wrong while sending OTP',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { sendOTP };
