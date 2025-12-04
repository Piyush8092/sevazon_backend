let MatrimonyModel = require('../../model/Matrimony');

const getSpecificMatrimony = async (req, res) => {
try{
    let id=req.params.id;

    // Populate applyMatrimony.applyUserId to include user IDs for frontend checking
    let result=await MatrimonyModel.findById({_id:id})
        .populate('applyMatrimony.applyUserId', '_id name email phone');

    if(!result){
        return res.status(404).json({message: 'Matrimony profile not found', status: 404, data: {}, success: false, error: true});
    }
    res.json({message: 'Matrimony profile retrieved successfully', status: 200, data: result, success: true, error: false});
}
catch(e){
    res.json({message: 'Something went wrong', status: 500, data: e.message, success: false, error: true});
}
};

module.exports = { getSpecificMatrimony };
