let jobModel = require('../../model/jobmodel');

const getTotalJobCount = async (req, res) => {
    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        let totalJobCount = await jobModel.countDocuments();
        res.json({
            message: 'Total job count retrieved successfully',
            status: 200,
            data: totalJobCount,
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

module.exports = { getTotalJobCount };



