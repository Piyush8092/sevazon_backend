let otpModel = require('../../model/otpModel');
const fast2smsService = require('../../services/fast2smsService');

const getOtp = async (req, res) => {
    try {
        let phone = req.params.phone;

        if (!phone) {
            return res.status(400).json({
                message: 'Phone number is required',
                status: 400,
                success: false,
                error: true
            });
        }

        console.log(`🔄 Resend OTP request for phone: ${phone}`);

        // Delete existing OTP if any
        const existingOTP = await otpModel.findOne({ phone: phone });
        if (existingOTP) {
            await otpModel.deleteOne({ phone: phone });
            console.log(`🗑️ Deleted existing OTP for ${phone}`);
        }

        // Generate new OTP
        const otp = fast2smsService.generateOTP();
        console.log(`🔐 Generated new OTP: ${otp} for ${phone}`);

        // Send OTP via Fast2SMS
        const smsResult = await fast2smsService.sendOTP(phone, otp);

        if (!smsResult.success) {
            console.error(`❌ Failed to send SMS: ${smsResult.message}`);
            return res.status(500).json({
                message: smsResult.message || 'Failed to resend OTP',
                status: 500,
                success: false,
                error: true,
                details: smsResult.error
            });
        }

        console.log(`✅ SMS sent successfully via Fast2SMS`);

        // Save new OTP to database
        const newOTP = new otpModel({
            phone: phone,
            otp: otp
        });

        await newOTP.save();
        console.log(`💾 New OTP saved to database for ${phone}`);

        // Return success response
        res.json({
            message: 'OTP resent successfully to your phone number',
            status: 200,
            data: {
                phone: phone,
                expiresIn: '5 minutes',
                // Only include OTP in development mode for testing
                ...(process.env.NODE_ENV === 'development' && { otp: otp })
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('❌ Error in resend OTP:', e);
        res.status(500).json({
            message: 'Something went wrong while resending OTP',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getOtp };
