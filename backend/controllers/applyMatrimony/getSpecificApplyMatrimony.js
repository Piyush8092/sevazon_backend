let MatrimonyModel = require('../../model/Matrimony');

const getSpecificApplyMatrimony = async (req, res) => {
    try {  
        let id=req.params.id;

        const result = await MatrimonyModel.find({_id:id})
            .populate('userId', 'name email phone')
            .populate('applyMatrimony.applyUserId', 'name email phone');
            res.json({message: 'All applications retrieved successfully', status: 200, data: result, success: true, error: false});
        }
        catch (e) {
            res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
        }
};

module.exports = { getSpecificApplyMatrimony };

