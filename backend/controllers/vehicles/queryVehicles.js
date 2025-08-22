let VehiclesModel = require('../../model/vehiclesModel');

const queryVehicles = async (req, res) => {
    try {       
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }
        
        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Search across multiple fields based on the vehicle model
        const searchQuery = {
            $or: [
                { profileId: regexQuery },
                { vehicleType: regexQuery },
                { brand: regexQuery },
                { model: regexQuery },
                { year: regexQuery },
                { fuelType: regexQuery },
                { transmissionType: regexQuery },
                { ownership: regexQuery },
                { kmDriven: regexQuery },
                { description: regexQuery },
                { fullName: regexQuery },
                { pincode: regexQuery },
                { address: regexQuery },
                { status: regexQuery }
            ]
        };
        
        const result = await VehiclesModel.find(searchQuery).skip(skip).limit(limit);
        const total = await VehiclesModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(total / limit);
        
        if(!result || result.length === 0){
            return res.status(404).json({message: 'No vehicles found'});
        }
        
        if(page < 1){
            return res.status(400).json({message: 'Invalid page number'});
        }
        
        if(page > totalPages){
            return res.status(400).json({message: 'Page number exceeds total pages'});
        }

        res.json({
            message: 'Vehicles retrieved successfully', 
            status: 200, 
            data: result,
            total,
            totalPages,
            currentPage: page,
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

module.exports = { queryVehicles };
