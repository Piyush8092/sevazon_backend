let userModel = require('../../model/userModel');

const getAuthUserDetail = async (req, res) => {
    try {  
        let userId=req.user._id;
        let result=await userModel.findById({_id:userId});
        if(!result){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        res.json({message: 'User detail retrieved successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAuthUserDetail };
