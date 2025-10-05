const faqModel = require("../../model/FaqModel");

const getFaq=async(req,res)=>{
    try{
        let page=req.query.page || 1;
        let limit= req.query.limit || 10;
        const skip = (page - 1) * limit;
        
        const result=await faqModel.find().skip(skip).limit(parseInt(limit));
        const total = await faqModel.countDocuments();
        const totalPages = Math.ceil(total / limit);
        
        res.json({
            message: 'FAQ retrieved successfully', 
            status: 200, 
            data: result, 
            total,
            totalPages,
            currentPage: parseInt(page),
            success: true, 
            error: false
        });
    }
    catch(e){
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
}

module.exports={getFaq};
