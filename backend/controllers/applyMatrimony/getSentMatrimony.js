let MatrimonyModel = require("../../model/Matrimony");

const getSentMatrimony = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    console.log(`[getSentMatrimony] userId: ${userId}, page: ${page}, limit: ${limit}`);
    // Find all matrimony profiles where the current user has applied
    const result = await MatrimonyModel.find({
      "applyMatrimony.applyUserId": userId,
    })
      .populate("userId", "name email phone")
      .populate("applyMatrimony.applyUserId", "name email phone")
      .skip(skip)
      .limit(limit);
    // Filter to only return profiles where user has applied
    // and extract the application status for each profile
    const sentRequests = result.map((matrimony) => {
      // Find the user's application in this profile
      const userApplication = matrimony.applyMatrimony.find(
        (app) => app.applyUserId && app.applyUserId._id.toString() === userId.toString()
      );
      // Return the matrimony profile with application status
      return {
        ...matrimony.toObject(),
        applicationStatus: userApplication ? userApplication.status : "Unknown",
        hasApplied: true,
        isPending: userApplication ? userApplication.status === "Pending" : false,
      };
    });
    const total = await MatrimonyModel.countDocuments({
      "applyMatrimony.applyUserId": userId,
    });
    const totalPages = Math.ceil(total / limit);
    return res.json({
      success: true,
      message: "Sent matrimony requests retrieved successfully",
      data: sentRequests,
      total,
      totalPages,
    });
  } catch (e) {
    console.error("[getSentMatrimony] Error:", e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: e.message || e,
    });
  }
};

module.exports = { getSentMatrimony };
