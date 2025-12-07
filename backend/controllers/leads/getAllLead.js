let leadModel = require('../../model/leadModel');
let userModel = require('../../model/userModel');

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

const getAllLead = async (req, res) => {
    try {
        // Check if user has created a Service/Business profile
        const userId = req.user._id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                status: 404,
                success: false,
                error: true
            });
        }

        // Verify user has Service/Business profile
        if (!user.AnyServiceCreate) {
            return res.status(403).json({
                message: 'You need to create a Service/Business profile to view leads',
                status: 403,
                success: false,
                error: true,
                requiresProfile: true
            });
        }

        let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering and sorting

        // Fetch all leads without pagination
        let result = await leadModel
            .find()
            .sort({ createdAt: -1 }) // Sort by newest first
            .populate('userId', 'name email phone pincode'); // Include pincode in populated user data

        // Sort by distance from user's pincode if provided (nearest first)
        // Since leads don't have their own pincode, we sort based on the creator's (userId) pincode
        if (pincode) {
            result = result.sort((a, b) => {
                const pincodeA = a.userId?.pincode;
                const pincodeB = b.userId?.pincode;
                const distanceA = calculatePincodeDistance(pincode, pincodeA);
                const distanceB = calculatePincodeDistance(pincode, pincodeB);
                return distanceA - distanceB;
            });
        }

        const total = result.length;

        res.json({
            message: 'Leads fetched successfully',
            status: 200,
            data: result,
            success: true,
            error: false,
            total,
            totalPages: 1
        });
    }
    catch (e) {
        res.json({message: 'Something went wrong', status: 500, data: e, success: false, error: true});
    }
};

module.exports = { getAllLead };
