let userModel = require('../../model/userModel');
let MatrimonyModel = require('../../model/Matrimony');

const getBookmarkMatrimonyProfile = async (req, res) => {
    try {  
        let userId=req.user._id;
        let result=await userModel.findById(userId).populate('matrimonyProfileBookmarkID', 'name email phone profileImage  businessName profileType serviceType   _id ');
        if(!result){
            res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
        }
        res.json({message: 'User detail retrieved successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getBookmarkMatrimonyProfile };



