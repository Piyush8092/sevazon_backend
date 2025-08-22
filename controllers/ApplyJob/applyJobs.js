let ApplyModel = require('../../model/ApplyModel');
const jobModel = require('../../model/jobmodel');
const MatrimonyModel = require('../../model/Matrimony');
const PropertyModel = require('../../model/property');

const ApplyedJob = async (req, res) => {
    try {       
        let id = req.params.job_id;
        let payload = req.body;
        let jobType = payload.jobType;

        let ExistJob;
        // Check which job type it belongs to
        if(jobType == 'JOB'){
            ExistJob = await jobModel.findById(id);
        }
        else if(jobType == 'MATRIMONY'){
            ExistJob = await MatrimonyModel.findById(id);
        }
        else if(jobType == 'PROPERTY'){
            ExistJob = await PropertyModel.findById(id);
        }

        if(!ExistJob){
            return res.status(400).json({message: 'Job not found'});
        }
        
        // Validate required fields
        if (!payload.fullName || !payload.gender || !payload.pincode || 
            !payload.city || !payload.state || !payload.address || 
            !payload.contactNumber || !payload.jobType) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Check if user already applied
        const existingApplication = await ApplyModel.findOne({
            userId: req.user._id,
            jobId: id
        });
        
        if (existingApplication) {
            return res.status(400).json({message: 'You have already applied for this job'});
        }
        
        payload.userId = req.user._id;
        payload.jobId = id;
        payload.job_creatorId = ExistJob.userId;
        
        const result = await ApplyModel.create(payload);
        res.json({message: 'Job application submitted successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { ApplyedJob };
