const VehiclesModel = require("../../model/vehiclesModel");

 
const deleteVehicles = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistJob = await VehiclesModel.findById(id);
        if (!ExistJob) {
            return res.status(404).json({message: 'Job not found'});
        }
        
        if (ExistJob.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await VehiclesModel.findByIdAndDelete(id);
        
        res.json({
            message: 'Job deleted successfully', 
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

module.exports = { deleteVehicles };

