 const faqModel = require('../../model/FaqModel');

const createFaq=async(req,res)=>{
    try{
let payload=req.body;
if(!payload.question || !payload.answer){
    return res.status(400).json({message: 'All fields are required'});
}

payload.userId = req.user._id;
const newContact=new faqModel(payload);
const result=await newContact.save();
res.json({message: 'FAQ created successfully', status: 200, data: result, success: true, error: false});
    }
    catch(e){
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
}

module.exports={createFaq};