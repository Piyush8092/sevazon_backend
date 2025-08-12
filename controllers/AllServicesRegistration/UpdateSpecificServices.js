const createServiceModel = require("../../model/createAllServiceModel");

 // put req for update account
const UpdateSpecificServices = async (req, res) => {
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
        let payload = req.body;
         const result = await createServiceModel.findByIdAndUpdate({_id:id}, payload, {new: true});

        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};
module.exports = {  UpdateSpecificServices };
