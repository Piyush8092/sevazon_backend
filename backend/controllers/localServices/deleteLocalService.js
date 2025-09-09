const LocalServiceModel = require("../../model/localServices");

  
const deleteLocalService = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistService = await LocalServiceModel.findById(id);
        if (!ExistService) {
            return res.status(404).json({message: 'Local service not found'});
        }
        
        if (ExistService.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await LocalServiceModel.findByIdAndDelete(id);
        
        res.json({
            message: 'Local service deleted successfully', 
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

module.exports = { deleteLocalService };

