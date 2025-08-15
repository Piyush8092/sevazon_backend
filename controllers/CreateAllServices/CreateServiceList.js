
const serviceListModel = require('../../model/ServiceListModel');
const  authGuard  = require('../../middleware/auth');

const createVarityServiceList = async (req, res) => {
    try {       
        let payload = req.body;
         if (!payload.name || !payload.image ) {
            return res.status(400).json({message: 'All fields are required'});
        }  
let ExistService=await serviceListModel.findOne({name:payload.name});
if(ExistService){
    return res.status(400).json({message: 'Service already exists'});
}


         let userId=req.user._id;
        // console.log(userId)
        payload.userId=userId;
        
        // Handle subService array safely
        if (payload.subService && Array.isArray(payload.subService)) {
            payload.subService = payload.subService
                .map((item) => ({
                    name: item.name,
                    image: item.image,
                }))
                .filter((item) => item.name && item.image);
        } else {
            payload.subService = [];
        }
        
        const newService = new serviceListModel(payload);
        const result = await newService.save();

        res.json({message: 'Service created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { createVarityServiceList };
