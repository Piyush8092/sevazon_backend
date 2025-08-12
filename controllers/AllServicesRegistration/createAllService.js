const createServiceModel = require("../../model/createAllServiceModel");
const user = require('../../model/userModel');

// post req for create account
const CreateAllServices = async (req, res) => {
    try {       

        let payload = req.body;
        if (!payload.title || !payload.description || !payload.location || !payload.salary || !payload.experience || !payload.skills || !payload.company || !payload.category || !payload.company_GSTIN || !payload.work_type || !payload.work_mode) {

            return res.status(400).json({message: 'All fields are required'});
        }   
        const Role= req.user.role;

        if(Role!='JOB_ADMIN' || Role!='SUPER_ADMIN'){
res.json({message: 'You are not authorized to create job', status: 401, data: {}, success: false, error: true});
        }

         payload.varified = true;    
        payload.job_poster_Id=req.user._id;
        const newJob = new createServiceModel(payload);
        const result = await newJob.save();

        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};


module.exports = { CreateAllServices };
