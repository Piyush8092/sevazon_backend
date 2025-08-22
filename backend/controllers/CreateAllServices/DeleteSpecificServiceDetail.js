    const serviceListModel=require('../../model/ServiceListModel');

      let deleteServiceListDetail = async(req,res)=>{
try{
    const id=req.params.id;
 let userId=req.user._id;
  let existService = await serviceListModel.findById(id);
        
        if (!existService) {
            return res.status(400).json({message: 'Service not found'});
        }

        if (userId.toString() !== existService.userId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

    const result=await serviceListModel.findByIdAndDelete({_id:id});
    res.json({message: 'Service List created successfully', status: 200, data: result, success: true, error: false});
}

catch(e){
    res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});s
}

    }
        
module.exports=deleteServiceListDetail