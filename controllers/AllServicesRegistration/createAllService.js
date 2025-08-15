const createServiceModel = require("../../model/createAllServiceProfileModel");
const user = require('../../model/userModel');

// post req for create account
const CreateAllServices = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Basic required fields for both profile types
        if (!payload.profileType || !payload.profileImage || !payload.yourName || !payload.gender || 
            !payload.pincode || !payload.city || !payload.state || !payload.area || 
            !payload.houseNumberBuilding || !payload.selectCategory || !payload.selectSubCategory || 
            !payload.email || !payload.locationURL || 
            payload.allowCallInApp === undefined || payload.allowCallViaPhone === undefined || 
            payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Profile type specific validation
        if (payload.profileType === 'Business Profile') {
            if (!payload.businessName || !payload.businessSummary || !payload.establishedInYear || 
                !payload.timing || !payload.workBusinessImages || payload.workBusinessImages.length === 0) {
                return res.status(400).json({message: 'All Business Profile fields are required'});
            }
        } else if (payload.profileType === 'Service Profile') {
            if (!payload.description || !payload.experience || 
                !payload.workServiceImages || payload.workServiceImages.length === 0) {
                return res.status(400).json({message: 'All Service Profile fields are required'});
            }
        }

        // Validate sub-category other field
        if (payload.selectSubCategory === 'Other' && !payload.subCategoryOther) {
            return res.status(400).json({message: 'Sub-category other field is required when Other is selected'});
        }

        // Validate phone number when call via phone is enabled
        if (payload.allowCallViaPhone === true && !payload.phoneNumberForCalls) {
            return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
        }

        // Set user ID and verification status
        payload.userId = req.user._id;
        payload.isVerified = true;
        
        const newService = new createServiceModel(payload);
        const result = await newService.save();

        res.json({
            message: 'Service profile created successfully', 
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

module.exports = { CreateAllServices };
