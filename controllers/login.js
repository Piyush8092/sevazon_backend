const user = require('../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const LoginRout = async (req, res) => {
    try {
        let payload = req.body;
         if (!payload.email || !payload.password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const existingUser = await user.findOne({ email: payload.email });
 
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(payload.password, existingUser.password);
 
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        let token = jwt.sign({id: existingUser._id}, process.env.SECRET_KEY, {expiresIn: '1d'});
        // console.log(token);
        res.cookie('jwt', token, {httpOnly: true, maxAge: 1000*60*60*24});

        res.json({ message: 'Login successful', status: 200, data: existingUser, success: true, error: false });
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { LoginRout };
