let contactModel=require('../../model/contactModel');

const deleteContact=async(req,res)=>{
    try{
        let id=req.params.id;
        let existContact=await contactModel.findById(id);
        
        if(!existContact){
            return res.status(404).json({message: 'Contact not found', status: 404, success: false, error: true});
        }
        if(req.user.role !== 'ADMIN'){
            return res.status(403).json({message: 'Unauthorized access', status: 403, success: false, error: true});
        }
        
        await contactModel.findByIdAndDelete(id);
        
        res.json({message: 'Contact deleted successfully', status: 200, success: true, error: false});
    }
    catch(e){
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
}

module.exports={deleteContact};
