let ApplyJob = require('../../model/ApplyModel');

const getAllApplyJob = async (req, res) => {
    try {  
         let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
        let role=req.user.role;
        if(role!=='ADMIN'){
            return res.json({message: 'not auth,something went wrong', status: 500,  success: false, error: true});
        }
        
        const result = await ApplyJob.find()
            .populate('jobId', 'title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode city state workType')
            .populate('ApplyuserId', 'name email phone')
            .populate('job_creatorId', 'name email phone')
            .skip(skip)
            .limit(limit);
            
        const total = await ApplyJob.countDocuments();
        const totalPages = Math.ceil(total / limit);

        res.json({message: 'All applications retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getAllApplyJob };
