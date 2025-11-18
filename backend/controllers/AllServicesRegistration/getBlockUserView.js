let createServiceModel = require('../../model/createAllServiceProfileModel');
const userModel = require('../../model/userModel');

const getBlockUserView = async (req, res) => {
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
        
        let ServiceReportAndBlockID=result.ServiceReportAndBlockID;
        res.json({
            message: 'Blocked service profiles retrieved successfully',
            status: 200,
            data: ServiceReportAndBlockID,
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

module.exports = { getBlockUserView };

