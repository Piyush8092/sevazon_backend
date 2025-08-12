 const adModel = require('../model/adModel');
 
// create ads
const CreateAdd = async (req, res) => {
    try {       

        let payload = req.body;
if (!payload.title || !payload.description || !payload.catagory || !payload.location || !payload.vaild_till) {
            return res.status(400).json({message: 'All fields are required'});
        }   
  
         payload.userId=req.user._id;
        const newJob = new adModel(payload);
        const result = await newJob.save();

        res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

// get all adds
const GetAllAdds = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
            const result = await adModel.find().skip(skip).limit(limit);
            const total = await adModel.countDocuments();
            const totalPages = Math.ceil(total / limit);
            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };


    // get specific add
    const GetSpecificAdd = async (req, res) => {
        try {       
            let id=req.params.id;
            const result = await adModel.findById({_id:id});
            if(!result){
                res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
            }
            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
        }

        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };


    // update specific add
    const UpdateSpecificAdd = async (req, res) => {
        try {       
            let id=req.params.id;
            let payload = req.body;
            let ExistJob=await adModel.findById({_id:id});
            if(!ExistJob){
                return res.status(400).json({message: 'not specific user exist'});
            }
            let UserId=req.user._id;
            if(ExistJob.userId!=UserId){
                return res.status(400).json({message: 'not specific user exist'});
            }
            const result = await adModel.findByIdAndUpdate({_id:id}, payload, {new: true});
            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };

    // delete specific add

    const DeleteSpecificAdd = async (req, res) => {
        try {       
            let id=req.params.id;
            let userId=req.user._id;
            let ExistJob=await adModel.findById({_id:id});
            if(!ExistJob){
                return res.status(400).json({message: 'not specific user exist'});
            }
            if(ExistJob.userId!=userId){
                return res.status(400).json({message: 'not specific user exist'});
            }
            const result = await adModel.findByIdAndDelete({_id:id});
            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };

    // query adds
    const queryAdds = async (req, res) => {
        try {       
            let payload = req.body;
            let query = req.query.query;
            if (!query) {
                return res.status(400).json({message: 'All fields are required'});
            }
            let regexQuery=new RegExp(query, 'i');
            let page = req.query.page || 1;
            let limit = req.query.limit || 10;
            const skip = (page - 1) * limit;
            const result = await adModel.find({title:regexQuery}).skip(skip).limit(limit);
            const total = await adModel.countDocuments({title:regexQuery});
            const totalPages = Math.ceil(total / limit);
            if(!result){
                return res.status(400).json({message: 'No data found'});
            }
            if(result.length==0){
                return res.status(400).json({message: 'No data found'});
            }
            if(result.length<limit){
                totalPages=page;
            }
            if(totalPages<page){
                return res.status(400).json({message: 'No data found'});
            }

            res.json({message: 'Job created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };



module.exports =  {CreateAdd,GetAllAdds,GetSpecificAdd,UpdateSpecificAdd,DeleteSpecificAdd,queryAdds} ;
