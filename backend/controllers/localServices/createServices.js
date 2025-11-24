const LocalServiceModel = require("../../model/localServices");

 
const createServicesRoute = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields
        if (!payload.title || !payload.yourNameBusinessInstituteFirmOrganisation || 
            !payload.selectCategory || !payload.selectSubCategory || 
            !payload.address || !payload.pincode || !payload.description || 
            payload.allowCallInApp === undefined || payload.allowCallViaPhone === undefined || 
            payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate subCategoryOther when selectSubCategory is "Other"
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Please specify other sub-category'});
        }

        // Validate phone number when call via phone is enabled
        if (payload.allowCallViaPhone === true) {
            if (!payload.phoneNumberForCalls || payload.phoneNumberForCalls.trim() === '') {
                return res.status(400).json({
                    message: 'Phone number is required when call via phone is enabled'
                });
            }
        } else {
            // If call via phone is disabled, set phone number to null
            payload.phoneNumberForCalls = null;
        }

        // Validate pincode format
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(payload.pincode)) {
            return res.status(400).json({message: 'Invalid pincode format'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        payload.userId = userId;
        payload.isVerified = true;

        const newService = new LocalServiceModel(payload);
        const result = await newService.save();

        res.json({
            message: 'Local service created successfully', 
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

module.exports = { createServicesRoute };
