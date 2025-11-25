let NewsPostModel = require('../../model/NewsPost');

const getTotalNewsCount = async (req, res) => {

    try {  
        if(req.user.role !== 'ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        let totalNewsCount = await NewsPostModel.countDocuments();
        res.json({
            message: 'Total news count retrieved successfully',
            status: 200,
            data: totalNewsCount,
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

module.exports = { getTotalNewsCount };


