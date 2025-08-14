let ApplyModel = require('../../model/ApplyModel');
const jobModel = require('../../model/jobmodel');

const ApplyedJob = async (req, res) => {
    try {       
  let id=req.params.job_id;
        let payload = req.body;
 let jobType=payload.job_type;

let  ExistJob;
// check which job tpe it belong
if(jobType=='JOB'){
ExistJob= await jobModel.findById({_id:id});
}
else if(jobType=='MATRIMONY'){
ExistJob= await MatrimonyModel.findById({_id:id});
}

else if(jobType=='PROPERTY'){
ExistJob= await PropertyModel.findById({_id:id});
}

 if(!ExistJob){
    return res.status(400).json({message: 'not specific job exist'});
}
    
payload.userId=req.user._id;
    payload.jobId=req.param.jobId;
    payload.job_creatorId=ExistJob.userId;

 
        const result = await ApplyModel.create(payload);
        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { ApplyedJob };
