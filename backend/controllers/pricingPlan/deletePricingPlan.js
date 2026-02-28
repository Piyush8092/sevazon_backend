const PricingPlan = require("../../model/pricingPlanModel");

const deletePricingPlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting isActive to false
    const deletedPlan = await PricingPlan.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!deletedPlan) {
      return res.status(404).json({
        message: "Pricing plan not found",
      });
    }

    res.status(200).json({
      message: "Pricing plan deleted successfully",
      data: deletedPlan,
    });
  } catch (error) {
    console.error("Error deleting pricing plan:", error);
    res.status(500).json({
      message: "Error deleting pricing plan",
      error: error.message,
    });
  }
};

module.exports = { deletePricingPlan };
