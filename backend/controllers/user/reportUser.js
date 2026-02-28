const UserReport = require("../../model/UserReportModel");
const userModel = require("../../model/userModel");

/**
 * Report a user
 * POST /api/report-user
 * Body: { reportedUserId, reason, description, contextType, contextId }
 */
const reportUser = async (req, res) => {
  try {
    const reporterId = req.user._id;
    const { reportedUserId, reason, description, contextType, contextId } = req.body;

    // Validation
    if (!reportedUserId || !reason) {
      return res.status(400).json({
        message: "Reported user ID and reason are required",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Check if reported user exists
    const reportedUser = await userModel.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({
        message: "Reported user not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Prevent self-reporting
    if (reporterId.toString() === reportedUserId.toString()) {
      return res.status(400).json({
        message: "You cannot report yourself",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Check if user has already reported this user
    const existingReport = await UserReport.findOne({
      reporterId: reporterId,
      reportedUserId: reportedUserId,
      status: { $in: ["pending", "reviewed"] },
    });

    if (existingReport) {
      return res.status(400).json({
        message: "You have already reported this user",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Create new report
    const newReport = new UserReport({
      reporterId,
      reportedUserId,
      reason,
      description: description || "",
      contextType: contextType || "direct_user",
      contextId: contextId || null,
      status: "pending",
    });

    const savedReport = await newReport.save();

    res.json({
      message: "User reported successfully. Our team will review this report.",
      status: 200,
      data: savedReport,
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error reporting user:", e);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { reportUser };
