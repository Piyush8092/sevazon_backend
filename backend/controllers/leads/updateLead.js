let leadModel = require('../../model/leadModel');

const updateLead = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;

        let ExistLead = await leadModel.findById(id);
        if (!ExistLead) {
            return res.status(404).json({message: 'Lead not found'});
        }

        if (ExistLead.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        const result = await leadModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Lead updated successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    }
    catch (e) {
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { updateLead };


