

const createServiceModel = require("../../model/createAllServiceModel");
// get specific service
const GetSpecificServices = async (req, res) => {
    try {       

        let id=req.params.id;
  
        const result = await createServiceModel.findById({_id:id});
if(!result){
    res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
}
        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { GetSpecificServices };
