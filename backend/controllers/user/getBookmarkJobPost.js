let userModel = require("../../model/userModel");

const getBookmarkJobPost = async (req, res) => {
  try {
    let userId = req.user._id;

    // Find user and populate bookmarked jobs (following service profile pattern)
    let result = await userModel.findById(userId).populate({
      path: "jobProfileBookmarkID",
      select:
        "title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode description salaryFrom salaryTo salaryPer requiredExperience workMode workShift workType allowCallInApp allowChat isActive isVerified createdAt _id",
      match: { isActive: true }, // Only show active jobs
    });

    if (!result) {
      return res.json({
        message: "User not found",
        status: 404,
        data: [],
        success: false,
        error: true,
      });
    }

    // Check if user has any bookmarked jobs
    if (!result.jobProfileBookmarkID || result.jobProfileBookmarkID.length === 0) {
      return res.json({
        message: "No bookmarked jobs found",
        status: 200,
        data: [],
        total: 0,
        success: true,
        error: false,
      });
    }

    res.json({
      message: "Bookmarked jobs retrieved successfully",
      status: 200,
      data: result.jobProfileBookmarkID,
      total: result.jobProfileBookmarkID.length,
      success: true,
      error: false,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { getBookmarkJobPost };
