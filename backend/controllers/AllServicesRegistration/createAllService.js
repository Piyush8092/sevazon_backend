const createServiceModel = require("../../model/createAllServiceProfileModel");
const userModel = require('../../model/userModel');
// POST request to create account/profile
const CreateAllServices = async (req, res) => {
  try {
    let payload = req.body;

    // --- Basic required fields (common for both profiles) ---
    if (
      !payload.profileType ||
      !payload.profileImage ||
      !payload.gender ||
      !payload.pincode ||
      !payload.city ||
      !payload.state ||
      !payload.area ||
      !payload.selectCategory ||
      !payload.selectSubCategory ||
      payload.allowCallInApp === undefined ||
      payload.allowCallViaPhone === undefined ||
      payload.allowChat === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    // --- Optional field handling ---
    // Convert empty locationURL to null (locationURL is optional)
    if (!payload.locationURL || payload.locationURL.trim() === '') {
      payload.locationURL = null;
    }

    // Convert empty houseNumberBuilding to null (houseNumberBuilding is optional)
    if (!payload.houseNumberBuilding || payload.houseNumberBuilding.trim() === '') {
      payload.houseNumberBuilding = null;
    }

    // Convert empty landmark to null (landmark is optional)
    if (!payload.landmark || payload.landmark.trim() === '') {
      payload.landmark = null;
    }

 
    // --- Conditional validation based on profile type ---
    if (payload.profileType === "Service Profile") {
      if (!payload.description) {
        return res
          .status(400)
          .json({ message: "Description is required for Service Profile" });
      }
      // Experience is optional - convert empty to null
      if (!payload.experience || payload.experience.trim() === '') {
        payload.experience = null;
      }
      if (!payload.workServiceImages || payload.workServiceImages.length === 0) {
        return res
          .status(400)
          .json({ message: "Work/Service images are required for Service Profile" });
      }

    }

    if (payload.profileType === "Business Profile") {
      if (!payload.businessName) {
        return res
          .status(400)
          .json({ message: "Business name is required for Business Profile" });
      }
      if (!payload.businessSummary) {
        return res
          .status(400)
          .json({ message: "Business summary is required for Business Profile" });
      }
     
      
      if (!payload.catalogImages || payload.catalogImages.length === 0) {
        return res
          .status(400)
          .json({ message: "Catalog images are required for Business Profile" });
      }
    }

    // --- Validate "Other" sub-category ---
    if (payload.selectSubCategory === "Other" && !payload.subCategoryOther) {
      return res.status(400).json({
        message: "Sub-category other field is required when 'Other' is selected",
      });
    }

    // --- Validate phone number when call via phone is enabled ---
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

    // Verification is optional - users can create profiles without verification
    // Note: Verification status will be tracked separately for display purposes

    // --- Attach user info from authGuard ---
    payload.userId = req.user._id;
    payload.email = req.user.email;
    payload.yourName = req.user.name;
    // Note: phoneNumberForCalls is already set from payload (user can use different verified number)

    // --- Save profile ---
    const newService = new createServiceModel(payload);
    const result = await newService.save();
    let user = await userModel.findById(req.user._id);
    if(user.AnyServiceCreate === false)
    {
      user.AnyServiceCreate = true;
      await user.save();
    }


    res.json({
      message: "Service profile created successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    // Handle validation errors
    if (e.name === "ValidationError") {
      const errors = Object.values(e.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        status: 400,
        data: errors,
        success: false,
        error: true,
      });
    }

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { CreateAllServices };
