const user = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SignupRout = async (req, res) => {
    try {
        let payload = req.body;
        // console.log(payload);

        if (!payload.name || (!payload.email && !payload.phone) || !payload.password || !payload.confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (payload.password !== payload.confirmPassword) {
            return res.status(400).json({ message: 'Password does not match' });
        }

        if (payload.password.length < 6 || payload.password.length > 50) {
            return res.status(400).json({ message: 'Password must be between 6 and 50 characters' });
        }

        if (payload.email) {  
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
        }

        if (payload.phone) {  
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(payload.phone)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
        }

        // check if user exists or is blocked
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
                return res.status(400).json({ message: 'User already exists' });
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
                return res.status(400).json({ message: 'User already exists' });
            }
        }

         const hashedPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashedPassword;
        payload.role = 'GENERAL';

        const newUser = new user(payload);
        // console.log("kdkdk",newUser);
        const result = await newUser.save();
         res.json({ message: 'User registered successfully', status: 200, data: result, success: true, error: false });

    } catch (e) {
        res.json({ message: 'Something went wrong', status: 500, data: e, success: false, error: true });
    }
};

module.exports = { SignupRout };
