let MatrimonyModel = require('../../model/Matrimony');

const getReportAndBlockMatrimonyProfile = async (req, res) => {
    try {  
        let userId = req.user._id;
        let result = await MatrimonyModel.find({
            'reportAndBlock': {
                $elemMatch: {
                    'reportAndBlockID': userId,
                    'block': true
                }
            }
        }).populate('userId', 'name email phone profileImage ');
        if(!result || result.length === 0){
            return res.json({
                message: 'No blocked profiles found',
                status: 404,
                data: [],
                success: false,
                error: true
            });
        }
        res.json({
            message: 'Blocked matrimony profiles retrieved successfully',
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

module.exports = { getReportAndBlockMatrimonyProfile };


