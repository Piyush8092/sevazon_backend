let PropertyModel = require('../../model/property');

const updateProperty = async (req, res) => {
    try {       
        let id = req.params.id;
        let payload = req.body;
        
        let ExistProperty = await PropertyModel.findById(id);
        if (!ExistProperty) {
            return res.status(404).json({message: 'Property not found'});
        }

        let UserId = req.user._id;
        if (ExistProperty.userId.toString() !== UserId.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({message: 'Unauthorized access'});
        }

        // Validate array fields if being updated
        if (payload.vehicleImages && (!Array.isArray(payload.vehicleImages) || payload.vehicleImages.length === 0)) {
            return res.status(400).json({message: 'Vehicle images must be a non-empty array'});
        }

        if (payload.vehicleImages && payload.vehicleImages.length > 6) {
            return res.status(400).json({message: 'Maximum 6 images are allowed'});
        }

        // Validate phone number when call via phone is enabled
        const allowCallViaPhone = payload.allowCallViaPhone !== undefined ? payload.allowCallViaPhone : ExistProperty.allowCallViaPhone;
        if (allowCallViaPhone === true) {
            const phoneNumber = payload.phoneNumberForCalls || ExistProperty.phoneNumberForCalls;
            if (!phoneNumber) {
                return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
            }
        }

        // Validate expected price if being updated
        if (payload.expectedPrice !== undefined && payload.expectedPrice <= 0) {
            return res.status(400).json({message: 'Expected price must be greater than 0'});
        }

        // Validate area sqft if being updated
        if (payload.areaSqft !== undefined && payload.areaSqft <= 0) {
            return res.status(400).json({message: 'Area sqft must be greater than 0'});
        }

        // Validate floor info if being updated
        if (payload.floorInfo) {
            if (payload.floorInfo.floorNo && payload.floorInfo.totalFloor) {
                const floorNo = parseInt(payload.floorInfo.floorNo);
                const totalFloor = parseInt(payload.floorInfo.totalFloor);
                if (floorNo > totalFloor) {
                    return res.status(400).json({message: 'Floor number cannot be greater than total floors'});
                }
            }
        }

        // Validate enum values if being updated
        if (payload.type) {
            const validType = ['sell', 'rent'];
            if (!validType.includes(payload.type)) {
                return res.status(400).json({message: 'Invalid property type'});
            }
        }

        if (payload.furnishing) {
            const validFurnishing = ['Unfurnished', 'Semifurnished', 'Fullyfurnished'];
            if (!validFurnishing.includes(payload.furnishing)) {
                return res.status(400).json({message: 'Invalid furnishing type'});
            }
        }

        if (payload.postedBy) {
            const validPostedBy = ['Owner', 'Dealer', 'Builder'];
            if (!validPostedBy.includes(payload.postedBy)) {
                return res.status(400).json({message: 'Invalid posted by value'});
            }
        }

        if (payload.rera) {
            const validRera = ['Rera Approved', 'Rera Registered dealer'];
            if (!validRera.includes(payload.rera)) {
                return res.status(400).json({message: 'Invalid RERA value'});
            }
        }

        const result = await PropertyModel.findByIdAndUpdate(id, payload, {
            new: true,
            runValidators: true
        });
        
        res.json({
            message: 'Property updated successfully', 
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

module.exports = { updateProperty };
