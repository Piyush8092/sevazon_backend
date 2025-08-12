let jobModel = require('../../model/jobmodel');

const deleteJob = async (req, res) => {
    try {       

        let id=req.params.id;
        let userId=req.user._id;
        let ExistJob=await jobModel.findById({_id:id});
        if(!ExistJob){
            return res.status(400).json({message: 'not specific user exist'});
        }
        if(ExistJob.userId!=userId){
            return res.status(400).json({message: 'not specific user exist'});
        }

        const result = await jobModel.findByIdAndDelete({_id:id});
        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { deleteJob };

