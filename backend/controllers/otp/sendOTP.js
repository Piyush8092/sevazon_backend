let otpModel = require('../../model/otpModel');
 
const sendOTP = async (req, res) => {
    try {  
        let payload = req.body;
        if (!payload.phone) {
            return res.status(400).json({message: 'Email is required'});
        }
        if(!payload.otp){
            return res.status(400).json({message: 'field all'});
        }
        
        const newOTP = new otpModel(payload);
        const result = await newOTP.save();
        res.json({message: 'OTP sent successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
        }
};

module.exports = { sendOTP };
