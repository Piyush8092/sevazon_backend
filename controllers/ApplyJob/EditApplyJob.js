let ApplyModel = require('../../model/ApplyModel');

const updateApplyJob = async (req, res) => {
    try {       
         let apply_id=req.params.apply_id;
        let payload = req.body;
let ExistApplicaton=await ApplyModel.findById({_id:apply_id});
if(!ExistApplicaton){
    return res.status(400).json({message: 'not specific user exist'});
}

 let Created_userId=ExistApplicaton.job_creatorId;
 
const userId=req.user._id;
if(Created_userId!=userId){
    return res.status(400).json({message: 'not specific user exist'});
}

let result=await ApplyModel.findByIdAndUpdate({_id:apply_id}, payload, {new: true});
  res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { updateApplyJob };
