let VehiclesModel = require('../../model/vehiclesModel');

const createVehicle = async (req, res) => {
    try {       
        let payload = req.body;
        
        // Validate all required fields
        if (!payload.vehicleType || !payload.brand || !payload.model || 
            !payload.year || !payload.fuelType || !payload.transmissionType || 
            !payload.ownership || !payload.kmDriven || !payload.expectedPrice || 
            !payload.description || !payload.fullName || !payload.pincode || 
            !payload.address || payload.allowCallInApp === undefined || 
            payload.allowCallViaPhone === undefined || payload.allowChat === undefined) {
            return res.status(400).json({message: 'All required fields must be provided'});
        }

        // Validate vehicle images
        if (!payload.vehicleImages || !Array.isArray(payload.vehicleImages) || 
            payload.vehicleImages.length < 1 || payload.vehicleImages.length > 6) {
            return res.status(400).json({message: 'Minimum 1 and maximum 6 vehicle images are required'});
        }

        // Validate phone number when call via phone is enabled
        if (payload.allowCallViaPhone === true && !payload.phoneNumberForCalls) {
            return res.status(400).json({message: 'Phone number is required when call via phone is enabled'});
        }

        // Validate enum values
        const validFuelTypes = ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric', 'LPG'];
        if (!validFuelTypes.includes(payload.fuelType)) {
            return res.status(400).json({message: 'Invalid fuel type'});
        }

        const validTransmissionTypes = ['Manual', 'Automatic'];
        if (!validTransmissionTypes.includes(payload.transmissionType)) {
            return res.status(400).json({message: 'Invalid transmission type'});
        }

        const validStatus = ['sell', 'rent'];
        if (payload.status && !validStatus.includes(payload.status)) {
            return res.status(400).json({message: 'Invalid status. Must be sell or rent'});
        }

        // Validate expected price
        if (payload.expectedPrice <= 0) {
            return res.status(400).json({message: 'Expected price must be greater than 0'});
        }

        let userId = req.user._id;
        if (!userId) {
            return res.status(400).json({message: 'User not authenticated'});
        }

        payload.userId = userId;
        payload.isVerified = true;

        const newVehicle = new VehiclesModel(payload);
        const result = await newVehicle.save();

        res.json({
            message: 'Vehicle created successfully', 
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

module.exports = { createVehicle };
