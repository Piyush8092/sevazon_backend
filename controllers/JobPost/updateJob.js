let jobModel = require('../../model/jobmodel');

const updateJob = async (req, res) => {
    try {       
        let id=req.params.id;
        let payload = req.body;
let ExistJob=await jobModel.findById({_id:id});
if(!ExistJob){
    return res.status(400).json({message: 'not specific user exist'});
}

        let UserId=req.user._id;
        if(ExistJob.userId!=UserId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await jobModel.findByIdAndUpdate({_id:id}, payload, {new: true});
        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { updateJob };
