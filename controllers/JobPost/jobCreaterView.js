let jobModel = require('../../model/jobmodel');

const getJobCreaterView = async (req, res) => {
    try {  
        let userId=req.user._id;
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        const result = await jobModel.find({userId:userId}).skip(skip).limit(limit);
        const total = await jobModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getJobCreaterView };
