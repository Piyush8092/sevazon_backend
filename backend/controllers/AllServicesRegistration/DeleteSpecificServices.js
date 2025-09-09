const createServiceModel = require("../../model/createAllServiceProfileModel");

// delete specific service
const DeleteSpecsificServices = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
  
        let ExistUser = await createServiceModel.findById(id);
        if (!ExistUser) {
            return res.status(404).json({message: 'Service not found'});
        }

        // Check ownership
        if (ExistUser.userId.toString() !== userId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }
         
        const result = await createServiceModel.findByIdAndDelete(id);
 
        res.json({
            message: 'Service deleted successfully', 
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

module.exports = { DeleteSpecsificServices };
