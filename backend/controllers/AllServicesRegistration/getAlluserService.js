 let createServiceModel = require('../../model/createAllServiceProfileModel');

const getAllServiceUser = async (req, res) => {
    try {
         let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering
        const skip = (page - 1) * limit;

        // Build query filter
        let queryFilter = {};

        // Filter by pincode if provided (location-based filtering)
        if (pincode) {
            queryFilter.pincode = pincode;
        }

        const result = await createServiceModel.find(queryFilter).skip(skip).limit(limit);
        const total = await createServiceModel.countDocuments(queryFilter);
        const totalPages = Math.ceil(total / limit);
        res.json({message: 'User services retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};

module.exports = { getAllServiceUser };

