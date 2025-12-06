const user = require('../model/userModel');
const TempSignup = require('../model/tempSignupModel');
const otpModel = require('../model/otpModel');
const jwt = require('jsonwebtoken');

/**
 * Verify Signup OTP and Create User Account
 * This endpoint is called after user enters OTP during signup
 * Flow:
 * 1. Verify OTP from database
 * 2. Retrieve temporary signup data
 * 3. Create user account
 * 4. Delete temporary data and OTP
 * 5. Log user in automatically
 */
const verifySignupOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        console.log('🔐 Verifying signup OTP for:', phone);

        // Validate input
        if (!phone || !otp) {
            return res.status(400).json({
                message: 'Phone number and OTP are required',
                status: 400,
                success: false,
                error: true
            });
        }

        // Verify OTP
        const otpRecord = await otpModel.findOne({
            phone: phone,
            otp: otp
        });

        if (!otpRecord) {
            console.log('❌ Invalid OTP for:', phone);
            return res.status(400).json({
                message: 'Invalid or expired OTP',
                status: 400,
                success: false,
                error: true
            });
        }

        console.log('✅ OTP verified for:', phone);

        // Retrieve temporary signup data
        const tempSignupData = await TempSignup.findOne({ phone: phone });

        if (!tempSignupData) {
            console.log('❌ No temporary signup data found for:', phone);
            return res.status(400).json({
                message: 'Signup session expired. Please signup again.',
                status: 400,
                success: false,
                error: true
            });
        }

        console.log('📋 Retrieved temporary signup data for:', phone);

        // Check if user already exists (double-check for race conditions)
        let existingUser = null;
        if (tempSignupData.email) {
            existingUser = await user.findOne({ email: tempSignupData.email });
        }
        if (!existingUser && tempSignupData.phone) {
            existingUser = await user.findOne({ phone: tempSignupData.phone });
        }

        if (existingUser) {
            // Clean up temporary data
            await TempSignup.deleteOne({ phone: phone });
            await otpModel.deleteOne({ phone: phone });
            
            return res.status(400).json({
                message: 'User already exists. Please login.',
                status: 400,
                success: false,
                error: true
            });
        }

        // Create user account with verified phone number
        const newUser = new user({
            name: tempSignupData.name,
            email: tempSignupData.email || undefined,
            phone: tempSignupData.phone,
            password: tempSignupData.password, // Already hashed
            role: tempSignupData.role || 'GENERAL',
            verified: true, // Mark as verified since phone is verified
        });

        const savedUser = await newUser.save();
        console.log('✅ User account created successfully:', savedUser._id);

        // Generate JWT token for auto-login
        const token = jwt.sign(
            { id: savedUser._id },
            process.env.SECRET_KEY || 'me333enneffiimsqoqomcngfehdj3idss',
            { expiresIn: '1d' }
        );

        // Set token in cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        // Clean up temporary data and OTP
        await TempSignup.deleteOne({ phone: phone });
        await otpModel.deleteOne({ phone: phone });
        console.log('🗑️  Cleaned up temporary data and OTP for:', phone);

        // Return success response with user data
        res.json({
            message: 'Account created successfully! You are now logged in.',
            status: 200,
            data: {
                user: savedUser,
                token: token
            },
            success: true,
            error: false
        });

    } catch (e) {
        console.error('❌ Verify signup OTP error:', e);
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { verifySignupOTP };

