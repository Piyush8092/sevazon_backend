let userModel = require('../../model/userModel');

const getUserDetail = async (req, res) => {


    try {  
        let userId=req.user._id;
        if(!userId){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        const role=req.user.role;
        if(role!=='ADMIN'){
            return res.json({message: 'Unauthorized access', status: 403, data: {}, success: false, error: true});
        }
         let result=await userModel.find();
        if(!result){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        res.json({message: 'User detail retrieved successfully', status: 200, data: result, success: true, error: false});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getUserDetail };
