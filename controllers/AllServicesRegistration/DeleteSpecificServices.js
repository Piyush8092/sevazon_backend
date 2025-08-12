const createServiceModel = require("../../model/createAllServiceModel");
// delete specific service

 const DeleteSpecsificServices = async (req, res) => {
    try {       
    let id=req.params.id;
        let userId=req.user._id;
        let ExistUser=await createServiceModel.findById({_id:id});
if(!ExistUser){
    return res.status(400).json({message: 'not specific user exist'});
}
        if (ExistUser._id!=userId) {
            return res.status(400).json({message: 'All fields are required'});
        }   
        const newJob = new createServiceModel.findByIdAndDelete({_id:id});
 
        res.json({message: 'Job created successfully', status: 200, data: newJob, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { DeleteSpecsificServices  };
