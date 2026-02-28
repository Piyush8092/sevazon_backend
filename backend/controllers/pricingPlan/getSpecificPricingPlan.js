const PricingPlan = require("../../model/pricingPlanModel");

const getSpecificPricingPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await PricingPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        message: "Pricing plan not found",
      });
    }

    res.status(200).json({
      message: "Pricing plan retrieved successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Error fetching pricing plan:", error);
    res.status(500).json({
      message: "Error fetching pricing plan",
      error: error.message,
    });
  }
};

module.exports = { getSpecificPricingPlan };
