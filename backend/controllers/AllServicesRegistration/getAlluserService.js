let createServiceModel = require("../../model/createAllServiceProfileModel");

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

const getAllServiceUser = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering and sorting
    const skip = (page - 1) * limit;

    // Build query filter
    let queryFilter = {};

    // Fetch all results without pincode filtering (we'll sort by distance instead)
    let result = await createServiceModel.find(queryFilter);

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
    result = result.slice(skip, skip + parseInt(limit));

    res.json({
      message: "User services retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAllServiceUser };
