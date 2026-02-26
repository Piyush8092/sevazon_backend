const User = require("../../model/userModel");

const getUserPlansAdminView = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        success: false,
      });
    }

    const user = await User.findById(userId).select("purchasedPlans").populate({
      path: "purchasedPlans.planId",
      model: "PricingPlan",
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User purchased plans retrieved successfully",
      success: true,
      data: user.purchasedPlans,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getUserPlansAdminView };
