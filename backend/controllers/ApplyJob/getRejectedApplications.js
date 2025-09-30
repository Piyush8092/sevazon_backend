let ApplyModel = require('../../model/ApplyModel');

const getRejectedApplications = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let userId = req.user._id;

        const result = await ApplyModel.find({
            job_creatorId: userId,
            accept_status: 'Rejected'
        })
        .populate('jobId', 'title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode city state workType')
        .populate('ApplyuserId', 'name email phone')
        .populate('job_creatorId', 'name email phone')
        .skip(skip)
        .limit(limit);
        
        const total = await ApplyModel.countDocuments({
            job_creatorId: userId,
            accept_status: 'Rejected'
        });
        const totalPages = Math.ceil(total / limit);

        res.json({
            message: 'Rejected applications retrieved successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false, 
            total, 
            totalPages
        });
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getRejectedApplications };
