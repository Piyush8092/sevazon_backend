const UserReport = require("../../model/UserReportModel");

/**
 * Get all user reports (Admin only)
 * GET /api/admin/reports
 * Query params: page, limit, status, search
 */
const getAllReports = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access. Admin only.",
        status: 403,
        success: false,
        error: true,
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Search by user name/email (if provided)
    if (req.query.search) {
      // This will be handled by populate and filter after query
    }

    // Get reports with populated user data
    const reports = await UserReport.find(query)
      .populate("reporterId", "name email phone profileImage")
      .populate("reportedUserId", "name email phone profileImage isBlocked accountStatus")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UserReport.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get status counts for dashboard
    const statusCounts = await UserReport.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      message: "Reports retrieved successfully",
      status: 200,
      data: reports,
      total,
      totalPages,
      currentPage: page,
      statusCounts,
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error fetching reports:", e);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAllReports };
