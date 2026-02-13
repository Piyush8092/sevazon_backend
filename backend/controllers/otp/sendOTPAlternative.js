const otpModel = require('../../model/otpModel');
const userModel = require('../../model/userModel');
const fast2smsService = require('../../services/fast2smsService');

/**
 * Send OTP to Alternative Phone Number
 * This endpoint is used to verify alternative/secondary phone numbers
 * that are different from the user's registered phone number
 * 
 * Use cases:
 * - Job postings with alternative contact numbers
 * - Matrimony profiles with different contact numbers
 * - Service/Business profiles with business phone numbers
 * - Offers with alternative contact numbers
 * 
 * @route POST /api/send-otp-alternative
 * @access Protected (requires authentication)
 */
const sendOTPAlternative = async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user._id;

        // Validate phone number
        if (!phone) {
            return res.status(400).json({
                message: 'Phone number is required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Clean phone number (remove +91, spaces, etc.)
        const cleanedPhone = phone.toString().replace(/\D/g, '');
        const last10Digits = cleanedPhone.slice(-10);

        // Validate phone number format (10 digits, starts with 6-9)
        if (!/^[6-9]\d{9}$/.test(last10Digits)) {
            return res.status(400).json({
                message: 'Invalid phone number format. Must be a valid 10-digit Indian mobile number.',
                status: 400,
                success: false,
                error: true
            });
        }

        console.log(`📱 Alternative phone OTP request from user ${userId} for phone: ${last10Digits}`);

        // Check if this phone number is the same as user's registered phone
        const user = await userModel.findById(userId);
        const registeredPhone = user.phone?.toString() || '';
        
        if (registeredPhone === last10Digits) {
            return res.status(400).json({
                message: 'This is your registered phone number. No verification needed.',
                status: 400,
                success: false,
                error: true,
                data: {
                    isRegisteredPhone: true
                }
            });
        }

        console.log(`✅ Phone ${last10Digits} is different from registered phone ${registeredPhone}`);

        // Generate OTP
        const otp = fast2smsService.generateOTP();
        console.log(`🔐 Generated OTP: ${otp} for alternative phone ${last10Digits}`);

        // Check if OTP already exists for this phone number and delete it
        const existingOTP = await otpModel.findOne({ phone: last10Digits });
        if (existingOTP) {
            await otpModel.deleteOne({ phone: last10Digits });
            console.log(`🗑️ Deleted existing OTP for ${last10Digits}`);
        }

        // Send OTP via Fast2SMS
        const smsResult = await fast2smsService.sendOTP(last10Digits, otp);

        if (!smsResult.success) {
            console.error(`❌ Failed to send SMS to alternative phone: ${smsResult.message}`);
            return res.status(500).json({
                message: smsResult.message || 'Failed to send OTP to alternative phone number',
                status: 500,
                success: false,
                error: true,
                details: smsResult.error
            });
        }

        console.log(`✅ SMS sent successfully to alternative phone via Fast2SMS`);

        // Save OTP to database
        const newOTP = new otpModel({
            phone: last10Digits,
            otp: otp
        });

        await newOTP.save();
        console.log(`💾 OTP saved to database for alternative phone ${last10Digits}`);

        // Return success response (don't send OTP in response for security)
        res.json({
            message: 'OTP sent successfully to the alternative phone number',
            status: 200,
            data: {
                phone: last10Digits,
                expiresIn: '5 minutes',
                isAlternativePhone: true,
                // Only include OTP in development mode for testing
                ...(process.env.NODE_ENV === 'development' && { otp: otp })
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('❌ Error in sendOTPAlternative:', e);
        res.status(500).json({
            message: 'Something went wrong while sending OTP to alternative phone',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { sendOTPAlternative };

