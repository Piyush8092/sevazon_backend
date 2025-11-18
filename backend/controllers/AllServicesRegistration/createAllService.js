const createServiceModel = require("../../model/createAllServiceProfileModel");

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
      !payload.houseNumberBuilding ||
      !payload.selectCategory ||
      !payload.selectSubCategory ||
      !payload.locationURL ||
      payload.allowCallInApp === undefined ||
      payload.allowCallViaPhone === undefined ||
      payload.allowChat === undefined
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

 
    // --- Conditional validation based on profile type ---
    if (payload.profileType === "Service Profile") {
      if (!payload.description) {
        return res
          .status(400)
          .json({ message: "Description is required for Service Profile" });
      }
      if (!payload.experience) {
        return res
          .status(400)
          .json({ message: "Experience is required for Service Profile" });
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
      if (!payload.establishedInYear) {
        return res
          .status(400)
          .json({ message: "Established in year is required for Business Profile" });
      }
      if (!payload.timing) {
        return res
          .status(400)
          .json({ message: "Business timing is required for Business Profile" });
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

    // --- Check if user has completed KYC verification ---
    if (!req.user.isKycVerified) {
      return res.status(403).json({
        message: "Please complete KYC verification first",
        status: 403,
        success: false,
        error: true,
        errorType: "VERIFICATION_REQUIRED",
      });
    }

    // --- Attach user info from authGuard ---
    payload.userId = req.user._id;
    payload.email = req.user.email;
    payload.yourName = req.user.name;
    payload.phoneNumberForCalls = req.user.phone;

    // --- Save profile ---
    const newService = new createServiceModel(payload);
    const result = await newService.save();

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
