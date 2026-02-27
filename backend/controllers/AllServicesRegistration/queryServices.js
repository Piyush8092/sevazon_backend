let createServiceModel = require('../../model/createAllServiceProfileModel');

/**
 * Helper function to calculate distance between two pincodes
 * Uses numerical difference as a simple approximation
 * @param {string} pincode1 - First pincode
 * @param {string} pincode2 - Second pincode
 * @returns {number} - Distance (numerical difference)
 */
const calculatePincodeDistance = (pincode1, pincode2) => {
    if (!pincode1 || !pincode2) return Infinity;
    const num1 = parseInt(pincode1);
    const num2 = parseInt(pincode2);
    if (isNaN(num1) || isNaN(num2)) return Infinity;
    return Math.abs(num1 - num2);
};

const queryServices = async (req, res) => {
    try {
        let query = req.query.query;
        if (!query) {
            return res.status(400).json({message: 'Query parameter is required'});
        }

        let regexQuery = new RegExp(query, 'i');
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering and sorting
        const skip = (page - 1) * limit;

        // Search across multiple fields based on the model
        const searchQuery = {
            $or: [
                { yourName: regexQuery },
                { businessName: regexQuery },
                { city: regexQuery },
                { state: regexQuery },
                { area: regexQuery },
                { selectCategory: regexQuery },
                { selectSubCategory: regexQuery },
                { subCategoryOther: regexQuery },
                { description: regexQuery },
                { businessSummary: regexQuery },
                { timing: regexQuery },
                { experience: regexQuery },
                { establishedInYear: regexQuery },
                { locationURL: regexQuery },
                { workServiceImages: regexQuery },
                { catalogImages: regexQuery },
                { timeSlot: regexQuery },
                { importantLink: regexQuery },


            ]
        };

        // Fetch all results without pincode filtering (we'll sort by distance instead)
        let result = await createServiceModel.find(searchQuery);

        // Sort by distance from user's pincode if provided (nearest first)
        if (pincode) {
            result = result.sort((a, b) => {
                const distanceA = calculatePincodeDistance(pincode, a.pincode);
                const distanceB = calculatePincodeDistance(pincode, b.pincode);
                return distanceA - distanceB;
            });
        }

        // Apply pagination after sorting
        const total = result.length;
        const totalPages = Math.ceil(total / limit);

        // Apply pagination slice
        result = result.slice(skip, skip + limit);

        res.json({
            message: 'Services retrieved successfully',
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

module.exports = { queryServices };
