let PropertyModel = require('../../model/property');

const deleteProperty = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        
        let ExistProperty = await PropertyModel.findById(id);
        if (!ExistProperty) {
            return res.status(404).json({message: 'Property not found'});
        }
        
        if (ExistProperty.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await PropertyModel.findByIdAndDelete(id);
        
        res.json({
            message: 'Property deleted successfully', 
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

module.exports = { deleteProperty };

