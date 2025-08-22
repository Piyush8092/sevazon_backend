const LocalServiceModel = require("../../model/localServices");

 
 
 
const updateLocalService = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistService = await LocalServiceModel.findById(id);
        if (!ExistService) {
            return res.status(404).json({message: 'Local service not found'});
        }

        let UserId = req.user._id;
        if (ExistService.userId.toString() !== UserId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate subCategoryOther when selectSubCategory is "Other"
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Please specify other sub-category'});
        }

        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : ExistService.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || ExistService.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }
        }

        // Validate pincode format if being updated
        if (payload.pincode) {
            const pincodeRegex = /^[1-9][0-9]{5}$/;
            if (!pincodeRegex.test(payload.pincode)) {
                return res.status(400).json({message: 'Invalid pincode format'});
            }
        }

        const result = await LocalServiceModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Local service updated successfully', 
            status: 200, 
            data: result, 
            success: true, 
            error: false
        });

    } catch (e) {
        // Handle validation errors
        if (e.name === 'ValidationError') {
            const errors = Object.values(e.errors).map(err => err.message);
            return res.status(400).json({
                message: 'Validation failed', 
                status: 400, 
                data: errors, 
                success: false, 
                error: true
            });
        }
        
        res.json({
            message: 'Something went wrong', 
            status: 500, 
            data: e.message, 
            success: false, 
            error: true
        });
    }
};

module.exports = { updateLocalService };
