let     userModel=require('../../model/userModel');
let MatrimonyModel = require('../../model/Matrimony');

const getBlockMatrimonyUserView = async (req, res) => {
   try {  
        let userId = req.user._id;
        let result = await userModel.findOne({_id:userId})


        if(!result || result.length === 0){
            return res.json({
                message: 'No blocked profiles found',
                status: 404,
                data: [],
                success: false,
                error: true
            });
        }
        
        let matrimonyReportAndBlockID=result.matrimonyReportAndBlockID;
        res.json({
            message: 'Blocked service profiles retrieved successfully',
            status: 200,
            data: matrimonyReportAndBlockID,
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

module.exports = { getBlockMatrimonyUserView };


