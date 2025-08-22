let contactModel=require('../../model/contactModel');

const createContact=async(req,res)=>{
    try{
let payload=req.body;
if(!payload.name || !payload.email || !payload.subject || !payload.message){
    return res.status(400).json({message: 'All fields are required'});
}
const newContact=new contactModel(payload);
const result=await newContact.save();
res.json({message: 'Contact created successfully', status: 200, data: result, success: true, error: false});
    }
    catch(e){
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
}

module.exports={createContact};