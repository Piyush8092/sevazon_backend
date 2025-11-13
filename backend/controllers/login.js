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
        existingUser.LastLoginTime = Date.now();
        await existingUser.save();
        res.json({ message: 'Login successful', status: 200, data: existingUser, success: true, error: false });
    } catch (e) {
        res.json({ message: 'Something went wrong', status: 500, data: e, success: false, error: true });
    }
};

module.exports = { LoginRout };
