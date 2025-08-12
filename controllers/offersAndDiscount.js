 const offer = require('../model/OfferModel');
 
// create ads
const createOffer = async (req, res) => {
    try {       

        let payload = req.body;
if (!payload.title || !payload.description || !payload.catagory || !payload.location || !payload.vaild_till) {
            return res.status(400).json({message: 'All fields are required'});
        }   
  
         payload.userId=req.user._id;
        const newoffer = new offer(payload);
        const result = await newoffer.save();

        res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false});

    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

// get all adds
const GetAllOffer = async (req, res) => {
    try {  
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        const skip = (page - 1) * limit;
            const result = await offer.find().skip(skip).limit(limit);
            const total = await offer.countDocuments();
            const totalPages = Math.ceil(total / limit);
            res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false, total, totalPages});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };


    // get specific add
    const GetSpecificOffer = async (req, res) => {
        try {       
            let id=req.params.id;
            const result = await offer.findById({_id:id});
            if(!result){
                res.json({message: 'No data found', status: 400, data: {}, success: false, error: true});
            }
            res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false});
        }

        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };


    // update specific add
    const UpdateSpecificOffer = async (req, res) => {
        try {       
            let id=req.params.id;
            let payload = req.body;
            let Existoffer=await offer.findById({_id:id});
            if(!Existoffer){
                return res.status(400).json({message: 'not specific user exist'});
            }
            let UserId=req.user._id;
            if(Existoffer.userId!=UserId){
                return res.status(400).json({message: 'not specific user exist'});
            }
            const result = await offer.findByIdAndUpdate({_id:id}, payload, {new: true});
            res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };

    // delete specific add

    const DeleteSpecificOffer = async (req, res) => {
        try {       
            let id=req.params.id;
            let userId=req.user._id;
            let Existoffer=await offer.findById({_id:id});
            if(!Existoffer){
                return res.status(400).json({message: 'not specific user exist'});
            }
            if(Existoffer.userId!=userId){
                return res.status(400).json({message: 'not specific user exist'});
            }
            const result = await offer.findByIdAndDelete({_id:id});
            res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };

    // query adds
    const queryOffer = async (req, res) => {
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
            const result = await offer.find({title:regexQuery}).skip(skip).limit(limit);
            const total = await offer.countDocuments({title:regexQuery});
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

            res.json({message: 'offer created successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    
            }
    };



module.exports =  { createOffer,GetAllOffer,GetSpecificOffer,UpdateSpecificOffer,DeleteSpecificOffer,queryOffer };