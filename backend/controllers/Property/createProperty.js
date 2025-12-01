let PropertyModel = require('../../model/property');
let userModel = require('../../model/userModel');

const createProperty = async (req, res) => {
    try {
        let payload = req.body;

        // Check if BHK is required based on property type
        const residentialProperties = ['Flat', 'House', 'Apartment', 'flat', 'house', 'apartment'];
        const isBhkRequired = residentialProperties.includes(payload.property);

        // Validate all required fields
        if (!payload.type || !payload.property ||
            !payload.propertyType || !payload.areaSqft ||
            !payload.facing || !payload.expectedPrice || !payload.description ||
            !payload.furnishing || !payload.possession || !payload.postedBy ||
             !payload.pincode || !payload.address ||
            payload.allowCallInApp === undefined ||
            payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate BHK only for residential properties
        if (isBhkRequired && !payload.bhk) {
            return res.status(400).json({message: 'BHK is required for residential properties (Flat, House, Apartment)'});
        }

        // Validate array fields
        if (!Array.isArray(payload.propertyImages) || payload.propertyImages.length === 0) {
            return res.status(400).json({message: 'At least one property image is required'});
        }
        if (payload.propertyImages.length > 6) {
            return res.status(400).json({message: 'Maximum 6 images are allowed'});
        }
 
        // Validate expected price
        if (payload.expectedPrice <= 0) {
            return res.status(400).json({message: 'Expected price must be greater than 0'});
        }

        // Validate area sqft
        if (payload.areaSqft <= 0) {
            return res.status(400).json({message: 'Area sqft must be greater than 0'});
        }

        // Validate enum values
        const validType = ['sell', 'rent'];
        if (!validType.includes(payload.type)) {
            return res.status(400).json({message: 'Invalid property type'});
        }

        const validFurnishing = ['Unfurnished', 'Semifurnished', 'Fullyfurnished'];
        if (!validFurnishing.includes(payload.furnishing)) {
            return res.status(400).json({message: 'Invalid furnishing type'});
        }

        const validPostedBy = ['Owner', 'Dealer', 'Builder'];
        if (!validPostedBy.includes(payload.postedBy)) {
            return res.status(400).json({message: 'Invalid posted by value'});
        }

        if (payload.rera) {
            const validRera = ['Rera Approved', 'Rera Registered dealer'];
            if (!validRera.includes(payload.rera)) {
                return res.status(400).json({message: 'Invalid RERA value'});
            }
        }

        // Validate floor info if provided
        if (payload.floorInfo) {
            if (payload.floorInfo.floorNo && payload.floorInfo.totalFloor) {
                const floorNo = parseInt(payload.floorInfo.floorNo);
                const totalFloor = parseInt(payload.floorInfo.totalFloor);
                if (floorNo > totalFloor) {
                    return res.status(400).json({message: 'Floor number cannot be greater than total floors'});
                }
            }
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

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        // Verification is optional - set isVerified based on user's KYC status
        // This allows unverified users to post, but marks their posts accordingly
        const isUserVerified = req.user.isKycVerified || false;

        payload.userId = userId;
        // Note: phoneNumberForCalls is already set from payload (user can use different verified number)
        payload.fullName = req.user.name;
        payload.isVerified = isUserVerified;

        const newProperty = new PropertyModel(payload);
        const result = await newProperty.save();
        let user = await userModel.findById(userId);
        if(user.AnyServiceCreate === false)
        {
          user.AnyServiceCreate = true;
          await user.save();
        }


        res.json({
            message: 'Property created successfully', 
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

module.exports = { createProperty };
