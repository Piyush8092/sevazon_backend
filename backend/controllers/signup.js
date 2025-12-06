const user = require('../model/userModel');
const TempSignup = require('../model/tempSignupModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fast2smsService = require('../services/fast2smsService');

/**
 * Modified Signup Route - Now sends OTP instead of creating account immediately
 * Flow:
 * 1. Validate signup data
 * 2. Check if user already exists
 * 3. Store signup data temporarily
 * 4. Send OTP to phone number
 * 5. User verifies OTP via /api/verify-signup-otp
 * 6. Account is created after OTP verification
 */
const SignupRout = async (req, res) => {
    try {
        let payload = req.body;
        console.log('📝 Signup request received:', {
            name: payload.name,
            email: payload.email,
            phone: payload.phone
        });

        // Validate required fields
        if (!payload.name || (!payload.email && !payload.phone) || !payload.password || !payload.confirmPassword) {
            return res.status(400).json({
                message: 'All fields are required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate passwords match
        if (payload.password !== payload.confirmPassword) {
            return res.status(400).json({
                message: 'Password does not match',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate password length
        if (payload.password.length < 6 || payload.password.length > 50) {
            return res.status(400).json({
                message: 'Password must be between 6 and 50 characters',
                status: 400,
                success: false,
                error: true
            });
        }

        // Validate email format
        if (payload.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                return res.status(400).json({
                    message: 'Invalid email format',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }

        // Validate phone format
        if (payload.phone) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(payload.phone)) {
                return res.status(400).json({
                    message: 'Invalid phone number format. Please enter 10 digits.',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }

        // Phone is required for OTP verification
        if (!payload.phone) {
            return res.status(400).json({
                message: 'Phone number is required for OTP verification',
                status: 400,
                success: false,
                error: true
            });
        }

        // Check if user already exists in main user collection
        let ExistUser = null;
        if (payload.email) {
            ExistUser = await user.findOne({ email: payload.email });
            if (ExistUser) {
                // Check if the existing user is blocked
                if (ExistUser.isBlocked || ExistUser.accountStatus === 'blocked') {
                    return res.status(403).json({
                        message: 'This email is associated with a blocked account. Please contact support.',
                        status: 403,
                        error: true,
                        success: false
                    });
                }
                return res.status(400).json({
                    message: 'User with this email already exists',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }

        if (payload.phone) {
            ExistUser = await user.findOne({ phone: payload.phone });
            if (ExistUser) {
                // Check if the existing user is blocked
                if (ExistUser.isBlocked || ExistUser.accountStatus === 'blocked') {
                    return res.status(403).json({
                        message: 'This phone number is associated with a blocked account. Please contact support.',
                        status: 403,
                        error: true,
                        success: false
                    });
                }
                return res.status(400).json({
                    message: 'User with this phone number already exists',
                    status: 400,
                    success: false,
                    error: true
                });
            }
        }

        // Hash password before storing temporarily
        const hashedPassword = await bcrypt.hash(payload.password, 10);

        // Delete any existing temporary signup data for this phone
        await TempSignup.deleteOne({ phone: payload.phone });
        console.log('🗑️  Deleted old temporary signup data for:', payload.phone);

        // Store signup data temporarily
        const tempSignupData = new TempSignup({
            name: payload.name,
            email: payload.email || null,
            phone: payload.phone,
            password: hashedPassword,
            role: 'GENERAL'
        });

        await tempSignupData.save();
        console.log('💾 Temporary signup data saved for:', payload.phone);

        // Generate and send OTP
        const otp = fast2smsService.generateOTP();
        console.log('🔐 Generated OTP for signup:', otp);

        // Send OTP via Fast2SMS
        const smsResult = await fast2smsService.sendOTP(payload.phone, otp);

        if (!smsResult.success) {
            // Clean up temp data if SMS fails
            await TempSignup.deleteOne({ phone: payload.phone });
            return res.status(500).json({
                message: 'Failed to send OTP. Please try again.',
                status: 500,
                success: false,
                error: true,
                details: smsResult.message
            });
        }

        console.log('✅ OTP sent successfully to:', payload.phone);

        // Store OTP in database (using existing OTP model)
        const otpModel = require('../model/otpModel');

        // Delete old OTP if exists
        await otpModel.deleteOne({ phone: payload.phone });

        // Save new OTP
        const otpData = new otpModel({
            phone: payload.phone,
            otp: otp
        });
        await otpData.save();
        console.log('💾 OTP saved to database for:', payload.phone);

        // Return success response (OTP only in development mode)
        const responseData = {
            phone: payload.phone,
            message: 'OTP sent successfully. Please verify to complete signup.',
            expiresIn: '5 minutes'
        };

        // Include OTP in response only in development mode
        if (process.env.NODE_ENV === 'development') {
            responseData.otp = otp;
        }

        res.json({
            message: 'OTP sent successfully to your phone number. Please verify to complete signup.',
            status: 200,
            data: responseData,
            success: true,
            error: false
        });

    } catch (e) {
        console.error('❌ Signup error:', e);
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { SignupRout };
