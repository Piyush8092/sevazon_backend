let MatrimonyModel = require('../../model/Matrimony');

const deleteMatrimony = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistMatrimony = await MatrimonyModel.findById(id);
        if (!ExistMatrimony) {
            return res.status(404).json({message: 'Matrimony profile not found'});
        }
        
        if (ExistMatrimony.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await MatrimonyModel.findByIdAndDelete(id);
        
        res.json({
            message: 'Matrimony profile deleted successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { deleteMatrimony };

