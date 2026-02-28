const userModel = require("../../model/userModel");
const UserReport = require("../../model/UserReportModel");

/**
 * Block a user (Admin only)
 * PUT /api/admin/block-user/:id
 * Body: { reason }
 */
const blockUser = async (req, res) => {
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

    const userId = req.params.id;
    const { reason } = req.body;

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Prevent blocking admin users
    if (user.role === "ADMIN") {
      return res.status(400).json({
        message: "Cannot block admin users",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Check if already blocked
    if (user.isBlocked) {
      return res.status(400).json({
        message: "User is already blocked",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Block user
    user.isBlocked = true;
    user.accountStatus = "blocked";
    user.blockedReason = reason || "Violation of terms and conditions";
    user.blockedAt = new Date();
    user.blockedBy = req.user._id;

    await user.save();

    // Update related reports to 'action_taken' status
    await UserReport.updateMany(
      { reportedUserId: userId, status: { $in: ["pending", "reviewed"] } },
      {
        status: "action_taken",
        actionTaken: "user_blocked",
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      }
    );

    res.json({
      message: "User blocked successfully",
      status: 200,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked,
        accountStatus: user.accountStatus,
        blockedReason: user.blockedReason,
        blockedAt: user.blockedAt,
      },
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error blocking user:", e);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

/**
 * Unblock a user (Admin only)
 * PUT /api/admin/unblock-user/:id
 */
const unblockUser = async (req, res) => {
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

    const userId = req.params.id;

    // Find user
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Check if user is blocked
    if (!user.isBlocked) {
      return res.status(400).json({
        message: "User is not blocked",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Unblock user
    user.isBlocked = false;
    user.accountStatus = "active";
    user.blockedReason = null;
    user.blockedAt = null;
    user.blockedBy = null;

    await user.save();

    res.json({
      message: "User unblocked successfully",
      status: 200,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isBlocked: user.isBlocked,
        accountStatus: user.accountStatus,
      },
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error unblocking user:", e);
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { blockUser, unblockUser };
