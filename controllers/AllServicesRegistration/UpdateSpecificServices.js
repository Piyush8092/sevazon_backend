const createServiceModel = require("../../model/createAllServiceProfileModel");

// put req for update account
const UpdateSpecificServices = async (req, res) => {
    try {       
        let id = req.params.id;
        let userId = req.user._id;
        let payload = req.body;
        
        // Find existing service
        let ExistUser = await createServiceModel.findById(id);
        if (!ExistUser) {
            return res.status(404).json({message: 'Service not found'});
        }
        
        // Check ownership
        if (ExistUser.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: 'Unauthorized access'});
        }
        
        // If profileType is being changed, validate accordingly
        const profileType = payload.profileType || ExistUser.profileType;
        
        // Profile type specific validation for updates
        if (payload.profileType && payload.profileType !== ExistUser.profileType) {
            // If changing profile type, validate all required fields for new type
            if (profileType === 'Business Profile') {
                if (!payload.businessName || !payload.businessSummary || !payload.establishedInYear || 
                    !payload.timing || !payload.workBusinessImages || payload.workBusinessImages.length === 0) {
                    return res.status(400).json({message: 'All Business Profile fields are required when changing to Business Profile'});
                }
            } else if (profileType === 'Service Profile') {
                if (!payload.description || !payload.experience || 
                    !payload.workServiceImages || payload.workServiceImages.length === 0) {
                    return res.status(400).json({message: 'All Service Profile fields are required when changing to Service Profile'});
                }
            }
        }
        
        // Validate sub-category other field if being updated
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-category other field is required when Other is selected'});
        }
        
        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : ExistUser.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || ExistUser.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }
        }
        
        // Email validation if being updated
        if (payload.email) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(payload.email)) {
                return res.status(400).json({message: 'Please enter a valid email'});
            }
        }
        
        // Update the service
        const result = await createServiceModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Service updated successfully', 
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

module.exports = { UpdateSpecificServices };
