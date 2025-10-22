let MatrimonyModel = require('../../model/Matrimony');

const rejectMatrimony = async (req, res) => {
    try{
        let id=req.params.id;
        let payload = req.body;
        let userId = req.user._id;
        let ExistMatrimony = await MatrimonyModel.findById(id);
        if(!ExistMatrimony){
            return res.status(400).json({message: 'not specific user exist'});
        }
        if(ExistMatrimony.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN'){
            return res.status(400).json({message: 'You cannot reject to  profile'});
    }
     let index = req.params.index;
     ExistMatrimony.applyMatrimony[index].reject = payload.reject;
     await ExistMatrimony.save();
     res.json({message: 'Matrimony application rejected successfully', status: 200, data: ExistMatrimony, success: true, error: false});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { rejectMatrimony };



