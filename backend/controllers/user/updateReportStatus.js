const UserReport = require("../../model/UserReportModel");

const updateReportStatus = async (req, res) => {
  try {
    // 🔒 Admin check
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access.",
        status: 403,
        success: false,
        error: true,
      });
    }

    const reportId = req.params.id;
    const { status } = req.body;

    // ✅ Validate status
    const allowedStatuses = ["pending", "reviewed", "action_taken", "dismissed"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
        status: 400,
        success: false,
        error: true,
      });
    }

    // 🔍 Find and update
    const updatedReport = await UserReport.findByIdAndUpdate(
      reportId,
      {
        status,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    );

    // ❌ If not found
    if (!updatedReport) {
      return res.status(404).json({
        message: "Report not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // ✅ Success response
    res.json({
      message: "Report status updated successfully",
      status: 200,
      data: updatedReport,
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error updating report status:", e);

    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateReportStatus };
