let userModel = require('../../model/userModel');

const getTotalUserCount = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        let totalUserCount = await userModel.countDocuments();
        res.json({
            message: 'Total user count retrieved successfully',
            status: 200,
            data: totalUserCount,
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

module.exports = { getTotalUserCount };


