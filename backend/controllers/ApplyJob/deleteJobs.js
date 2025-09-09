let ApplyModel = require('../../model/ApplyModel');

const deleteApplyJob = async (req, res) => {
    try {       
        let apply_id=req.params.apply_id;
        let userId = req.user._id;
        let ExistApplicaton=await ApplyModel.findById(apply_id);
        if(!ExistApplicaton){
            return res.status(400).json({message: 'not specific user exist'});
        }

        let Created_userId=ExistApplicaton.job_creatorId;
        if(Created_userId!=userId && req.user.role !== 'ADMIN')   {
            return res.status(400).json({message: 'not specific user exist'});
        }
        const result = await ApplyModel.findByIdAndDelete(apply_id);
        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { deleteApplyJob };


