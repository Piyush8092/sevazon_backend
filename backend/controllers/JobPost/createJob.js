let jobModel = require("../../model/jobmodel");
const userModel = require("../../model/userModel");
const VerifiedPhone = require("../../model/verifiedPhoneModel");

const createJob = async (req, res) => {
  try {
    let payload = req.body;

    // Validate all required fields
    if (
      !payload.title ||
      !payload.yourNameBusinessInstituteFirmCompany ||
      !payload.selectCategory ||
      !payload.selectSubCategory ||
      !payload.address ||
      !payload.pincode ||
      !payload.description ||
      !payload.salaryFrom ||
      !payload.salaryTo ||
      !payload.salaryPer ||
      !payload.workShift ||
      !payload.workMode ||
      !payload.workType ||
      payload.allowCallInApp === undefined ||
      payload.allowChat === undefined
    ) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Validate array fields
    if (!Array.isArray(payload.workShift) || payload.workShift.length === 0) {
      return res.status(400).json({ message: "Work shift is required" });
    }
    if (!Array.isArray(payload.workMode) || payload.workMode.length === 0) {
      return res.status(400).json({ message: "Work mode is required" });
    }
    if (!Array.isArray(payload.workType) || payload.workType.length === 0) {
      return res.status(400).json({ message: "Work type is required" });
    }

    // Validate sub-category other field
    if (payload.selectSubCategory === "Other" && !payload.subCategoryOther) {
      return res
        .status(400)
        .json({ message: "Sub-category other field is required when Other is selected" });
    }

    // Validate phone number when call via phone is enabled
    if (payload.allowCallViaPhone === true) {
      if (!payload.phoneNumberForCalls || payload.phoneNumberForCalls.trim() === "") {
        return res.status(400).json({
          message: "Phone number is required when call via phone is enabled",
        });
      }

      // Check if phone number is verified (unless it's the user's registered phone)
      let userId = req.user._id;
      const user = await userModel.findById(userId);
      const registeredPhone = user.phone?.toString() || "";
      const cleanedPhone = payload.phoneNumberForCalls.toString().replace(/\D/g, "");
      const last10Digits = cleanedPhone.slice(-10);

      // If it's not the registered phone, check if it's verified
      if (registeredPhone !== last10Digits) {
        const isVerified = await VerifiedPhone.isPhoneVerified(userId, last10Digits);
        if (!isVerified && req.user.role !== "ADMIN") {
          return res.status(400).json({
            message:
              "Phone number must be verified via OTP before creating a job post. Please verify the phone number first.",
            status: 400,
            success: false,
            error: true,
            data: {
              phoneNotVerified: true,
              phone: last10Digits,
            },
          });
        }
        console.log(`✅ Alternative phone ${last10Digits} is verified for user ${userId}`);
      } else {
        console.log(`✅ Using registered phone ${registeredPhone} - no verification needed`);
      }
    } else {
      // If call via phone is disabled, set phone number to null
      payload.phoneNumberForCalls = null;
    }

    // Validate salary range
    if (payload.salaryFrom >= payload.salaryTo) {
      return res.status(400).json({ message: "Salary from must be less than salary to" });
    }

    // Validate enum values
    const validSalaryPer = ["Per Month", "Per Year", "Per Day", "Per Hour"];
    if (!validSalaryPer.includes(payload.salaryPer)) {
      return res.status(400).json({ message: "Invalid salary period" });
    }

    const validWorkShift = ["Day Shift", "Night Shift"];
    if (!payload.workShift.every((shift) => validWorkShift.includes(shift))) {
      return res.status(400).json({ message: "Invalid work shift value" });
    }

    const validWorkMode = ["On-site", "Remote", "Hybrid"];
    if (!payload.workMode.every((mode) => validWorkMode.includes(mode))) {
      return res.status(400).json({ message: "Invalid work mode value" });
    }

    const validWorkType = ["Full-time", "Part-time", "Intern"];
    if (!payload.workType.every((type) => validWorkType.includes(type))) {
      return res.status(400).json({ message: "Invalid work type value" });
    }

    let userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    payload.userId = userId;
    payload.isVerified = false;

    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "ADMIN") {
      // If no paid limit
      if (user.jobPostLimit <= 0) {
        return res.status(403).json({
          message: "Post limit exceeded. Please purchase a plan.",
        });
      }
    }

    const newJob = new jobModel(payload);
    const result = await newJob.save();

    let updateQuery = {
      $set: { AnyServiceCreate: true },
    };

    // If user has job posts → decrease limit
    if (user.jobPostLimit > 0 && user.role !== "ADMIN") {
      updateQuery.$inc = { jobPostLimit: -1 };
    }

    await userModel.findByIdAndUpdate(userId, updateQuery);

    res.json({
      message: "Job created successfully",
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

    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { createJob };
