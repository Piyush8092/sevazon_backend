const user = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SignupRout = async (req, res) => {
    try {
        let payload = req.body;
        if (!payload.name || (!payload.email && !payload.phone) || !payload.password || !payload.confirmPassword) {
            return res.status(400).json({message: 'Name, password, confirmPassword and at least one of email or phone are required'});
        }
        if (payload.password !== payload.confirmPassword) {
            return res.status(400).json({message: 'Password does not match'});
        }
        if (payload.password.length < 6 || payload.password.length > 50) {
            return res.status(400).json({message: 'Password must be between 6 and 50 characters'});
        }
        
        if(payload.email){  
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(payload.email)) {
                return res.status(400).json({message: 'Invalid email format'});
            }
        }
        if(payload.phone){  
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(payload.phone)) {
                return res.status(400).json({message: 'Invalid phone number format'});
            }
        }

        let ExistUser = null;
        
        if(payload.email){
            ExistUser = await user.findOne({email: payload.email});
            if (ExistUser) {
                return res.status(400).json({message: 'User with this email already exists'});
            }
        }
        if(payload.phone){  
            ExistUser = await user.findOne({phone: payload.phone});
            if (ExistUser) {
                return res.status(400).json({message: 'User with this phone number already exists'});
            }
        }

        const hashedPassword = await bcrypt.hash(payload.password, 10);
        payload.password = hashedPassword;
        payload.role='GENERAL';
        const newUser = new user(payload);
        const result = await newUser.save();

        res.json({message: 'User registered successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { SignupRout };
