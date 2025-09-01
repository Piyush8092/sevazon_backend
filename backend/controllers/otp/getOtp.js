let otpModel = require('../../model/otpModel');

const getOtp = async (req, res) => {
    try {  
        let phone = req.params.phone;
        if (!phone) {
            return res.status(400).json({message: 'Email is required'});
        }
        
        let existphone=await otpModel.findOne({phone: phone});
        if(!existphone){
            return res.status(400).json({message: 'Invalid phone number'});
        }
        res.json({message: 'OTP sent successfully', status: 200, data: existphone, success: true, error: false});
    }   
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
        }
};

module.exports = { getOtp };
