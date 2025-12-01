let userModel = require('../../model/userModel');

const getAllUserForNotification = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }

        let result=await userModel.find().select('name email phone _id');
        if(!result || result.length === 0){
            return res.json({
                message: 'No users found',
                status: 404,
                data: [],
                success: false,
                error: true
            });
        }
        res.json({
            message: 'Users retrieved successfully',
            status: 200,
            data: result,
            total: result.length,
            success: true,
            error: false
        });
    }
    catch (e) {
        res.json({
            message: 'Something went wrong',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getAllUserForNotification };

