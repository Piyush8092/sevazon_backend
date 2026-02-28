const User = require("../../model/userModel");

const getLoginUserPlans = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
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

    const currentDate = new Date();

    // ✅ Filter only active plans
    const activePlans = user.purchasedPlans.filter(
      (plan) => plan.endDate && plan.endDate > currentDate
    );

    return res.status(200).json({
      message: "Active plans retrieved successfully",
      success: true,
      data: activePlans,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message,
    });
  }
};

module.exports = { getLoginUserPlans };
