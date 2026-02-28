const PricingPlan = require("../../model/pricingPlanModel");

const getPricingPlansByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validate category
    const validCategories = ["service-business", "post", "ads"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Invalid category. Must be one of: service-business, post, ads",
      });
    }

    const plans = await PricingPlan.find({ category, isActive: true }).sort({
      displayOrder: 1,
      createdAt: 1,
    });

    res.status(200).json({
      message: "Pricing plans retrieved successfully",
      data: plans,
      count: plans.length,
    });
  } catch (error) {
    console.error("Error fetching pricing plans by category:", error);
    res.status(500).json({
      message: "Error fetching pricing plans",
      error: error.message,
    });
  }
};

module.exports = { getPricingPlansByCategory };
