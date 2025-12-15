
const createServiceModel = require("../../model/createAllServiceProfileModel");

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

/**
 * 4-tier sorting priority:
 * 1. Premium/Featured from user's district
 * 2. Regular from user's district
 * 3. Premium/Featured from other districts
 * 4. Regular from other districts
 */
const sortByDistrictAndType = (services, userDistrict) => {
    return services.sort((a, b) => {
        const aDistrict = a.district || '';
        const bDistrict = b.district || '';
        const aType = a.serviceType || 'null';
        const bType = b.serviceType || 'null';

        const aIsPremiumOrFeatured = aType === 'premium' || aType === 'featured';
        const bIsPremiumOrFeatured = bType === 'premium' || bType === 'featured';
        const aIsSameDistrict = aDistrict.toLowerCase() === userDistrict.toLowerCase();
        const bIsSameDistrict = bDistrict.toLowerCase() === userDistrict.toLowerCase();

        // Tier 1: Premium/Featured from user's district
        if (aIsSameDistrict && aIsPremiumOrFeatured && (!bIsSameDistrict || !bIsPremiumOrFeatured)) return -1;
        if (bIsSameDistrict && bIsPremiumOrFeatured && (!aIsSameDistrict || !aIsPremiumOrFeatured)) return 1;

        // Tier 2: Regular from user's district
        if (aIsSameDistrict && !aIsPremiumOrFeatured && (!bIsSameDistrict || bIsPremiumOrFeatured)) return -1;
        if (bIsSameDistrict && !bIsPremiumOrFeatured && (!aIsSameDistrict || aIsPremiumOrFeatured)) return 1;

        // Tier 3: Premium/Featured from other districts
        if (!aIsSameDistrict && aIsPremiumOrFeatured && (!bIsSameDistrict || !bIsPremiumOrFeatured)) return -1;
        if (!bIsSameDistrict && bIsPremiumOrFeatured && (!aIsSameDistrict || !aIsPremiumOrFeatured)) return 1;

        // Tier 4: Regular from other districts (maintain current order)
        return 0;
    });
};

// get all services
const GetAllServices = async (req, res) => {
    try {
        let page = req.query.page || 1;
        let limit = req.query.limit || 10;
        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering and sorting
        let district = req.query.district; // Optional district for district-based sorting
        const skip = (page - 1) * limit;

        // Build query filter - exclude current user's services
        let queryFilter = {userId:{$nin: [req.user._id]}};

        // Fetch all results without pincode filtering (we'll sort by district/distance instead)
        let result = await createServiceModel.find(queryFilter).populate('userId', 'name email phone');

        // Sort by district-based 4-tier priority if district is provided
        if (district) {
            result = sortByDistrictAndType(result, district);
        }
        // Fallback to pincode-based sorting if only pincode is provided
        else if (pincode) {
            result = result.sort((a, b) => {
                const distanceA = calculatePincodeDistance(pincode, a.pincode);
                const distanceB = calculatePincodeDistance(pincode, b.pincode);
                return distanceA - distanceB;
            });
        }

        // Apply pagination after sorting
        const total = result.length;
        const totalPages = Math.ceil(total / limit);
        result = result.slice(skip, skip + parseInt(limit));

        res.json({message: 'Services retrieved successfully', status: 200, data: result, success: true, error: false, total, totalPages});
    } catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});

        }
};


module.exports = { GetAllServices };
