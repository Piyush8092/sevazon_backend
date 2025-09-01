let otpModel = require('../../model/otpModel');

const verifyOTP = async (req, res) => {
    try {  
        let payload = req.body;
        if (!payload.phone) {
            return res.status(400).json({message: 'Email is required'});
        }
 if(!payload.otp){
            return res.status(400).json({message: 'field all'});
        }

        let existphone=await otpModel.findOne({phone: payload.phone});
        if(!existphone){
            return res.status(400).json({message: 'Invalid phone number'});
        }
        
        
const result = await otpModel.findOne({
    $and: [
        { phone: payload.phone },
        { otp: payload.otp }
    ]
});   
     if(!result){
            return res.status(400).json({message: 'Invalid OTP'});
        }
        res.json({message: 'OTP verified successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
        }
};

module.exports = { verifyOTP };
