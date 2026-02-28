let leadModel = require("../../model/leadModel");
let userModel = require("../../model/userModel");

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
 * Sort leads by district (leads use the creator's district from userId)
 * Since leads don't have premium/featured status, we only sort by district match
 * Priority:
 * 1. Leads from user's district
 * 2. Leads from other districts
 */
const sortByDistrict = (leads, userDistrict) => {
  return leads.sort((a, b) => {
    const aDistrict = a.userId?.district || "";
    const bDistrict = b.userId?.district || "";

    const aIsSameDistrict = aDistrict.toLowerCase() === userDistrict.toLowerCase();
    const bIsSameDistrict = bDistrict.toLowerCase() === userDistrict.toLowerCase();

    // Leads from user's district come first
    if (aIsSameDistrict && !bIsSameDistrict) return -1;
    if (!aIsSameDistrict && bIsSameDistrict) return 1;

    // Maintain current order for same tier
    return 0;
  });
};
const getAllLead = async (req, res) => {
  try {
    // Check if user has created a Service/Business profile
    const userId = req.user._id;
    console.log(userId);
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
        success: false,
        error: true,
      });
    }
    // Verify user has Service/Business profile
    if (!user.AnyServiceCreate) {
      return res.status(403).json({
        message: "You need to create a Service/Business profile to view leads",
        status: 403,
        success: false,
        error: true,
        requiresProfile: true,
      });
    }

    let pincode = req.query.pincode; // Optional filter by pincode for location-based filtering and sorting
    let district = req.query.district; // Optional district for district-based sorting

    // Fetch all leads without pagination
    let result = await leadModel
      .find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate("userId", "name email phone pincode district"); // Include pincode and district in populated user data
    let fullData = result.map((lead) => ({
      _id: lead._id,
      userId: lead.userId?._id,
      serviceid: lead.serviceid,
      businessid: lead.businessid,
      userPincode: lead.userId?.pincode,
      userDistrict: lead.userId?.district,
    }));
    console.log("fullData", fullData);
    // Debug log for lead IDs
    result.forEach((lead) => {
      console.log("DEBUG: Lead fetched:", {
        _id: lead._id,
        userId: lead.userId?._id,
        serviceid: lead.serviceid,
        businessid: lead.businessid,
      });
    });

    // Sort by district-based priority if district is provided
    if (district) {
      result = sortByDistrict(result, district);
    }
    // Fallback to pincode-based sorting if only pincode is provided
    else if (pincode) {
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
      message: "Leads fetched successfully",
      status: 200,
      data: result,
      fullData: fullData,
      success: true,
      error: false,
      total,
      totalPages: 1,
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

module.exports = { getAllLead };
