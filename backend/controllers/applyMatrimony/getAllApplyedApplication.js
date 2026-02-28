let MatrimonyModel = require("../../model/Matrimony");

const getAllApplyApplication = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100; // Increased for better UX
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    console.log(`[getAllApplyApplication] userId: ${userId}, page: ${page}, limit: ${limit}`);

    // Find the current user's own matrimony profile with pending applications
    const myProfile = await MatrimonyModel.findOne({
      userId: userId,
      "applyMatrimony.0": { $exists: true }, // Has at least one application
    })
      .populate("userId", "name email phone")
      .populate("applyMatrimony.applyUserId", "name email phone profileImage");

    if (!myProfile || !myProfile.applyMatrimony || myProfile.applyMatrimony.length === 0) {
      return res.json({
        success: true,
        message: "No applications found",
        data: [],
        total: 0,
        totalPages: 0,
        currentUserProfileId: null,
      });
    }

    // Filter for active/pending applications
    const pendingApplications = myProfile.applyMatrimony.filter(
      (app) => app.applyMatrimonyStatus === true && app.status === "Pending"
    );

    if (pendingApplications.length === 0) {
      return res.json({
        success: true,
        message: "No pending applications found",
        data: [],
        total: 0,
        totalPages: 0,
        currentUserProfileId: myProfile._id.toString(),
      });
    }

    // Get all applicant user IDs
    const applicantIds = pendingApplications
      .map((app) => app.applyUserId?._id || app.applyUserId)
      .filter((id) => id);

    // Fetch applicant's matrimony profiles with application index
    const applicantProfiles = await MatrimonyModel.find({
      userId: { $in: applicantIds },
    })
      .populate("userId", "name email phone profileImage")
      .skip(skip)
      .limit(limit);

    // Enhance profiles with application metadata (index and current user's profile ID)
    const enhancedProfiles = applicantProfiles.map((profile) => {
      // Find the application index in myProfile's applyMatrimony array
      const applicationIndex = myProfile.applyMatrimony.findIndex(
        (app) =>
          app.applyUserId &&
          (app.applyUserId._id?.toString() === profile.userId._id.toString() ||
            app.applyUserId.toString() === profile.userId._id.toString())
      );

      // Convert to plain object and add metadata
      const profileObj = profile.toObject();
      profileObj.applicationIndex = applicationIndex;
      profileObj.targetProfileId = myProfile._id.toString(); // Current user's profile ID

      return profileObj;
    });

    const total = applicantIds.length;
    const totalPages = Math.ceil(total / limit);

    return res.json({
      success: true,
      message: "All applications retrieved successfully",
      data: enhancedProfiles,
      total,
      totalPages,
      currentUserProfileId: myProfile._id.toString(), // Current user's profile ID
    });
  } catch (e) {
    console.error("[getAllApplyApplication] Error:", e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: e.message || e,
    });
  }
};

module.exports = { getAllApplyApplication };
