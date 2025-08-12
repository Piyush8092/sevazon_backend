let jobModel = require('../../model/jobmodel');

const createJob = async (req, res) => {
    try {       
        let payload = req.body;
        if (!payload.title || !payload.salary) {
            return res.status(400).json({message: 'All fields are required'});
        }   
let userId=req.user._id;
if(!userId){
    return res.status(400).json({message: 'not specific user exist'});
}
let existUser=await jobModel.findById({_id:userId});
if(!existUser){
    return res.status(400).json({message: 'not specific user exist'});
}
        payload.userId = userId;

        const newJob = new jobModel(payload);
        const result = await newJob.save();

        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
    };

module.exports = { createJob };
