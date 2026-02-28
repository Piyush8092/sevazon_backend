const FeaturedCategoryModel = require("../../model/FeaturedCategoryModel");

/**
 * Clear/deactivate a featured category for a specific type
 * Admin only endpoint - requires authentication
 */
const clearFeaturedCategory = async (req, res) => {
  try {
    const { categoryType } = req.body;

    // Validate required fields
    if (!categoryType) {
      return res.status(400).json({
        success: false,
        message: "Category type is required",
      });
    }

    // Validate category type
    const validTypes = ["seasonal", "wedding", "education"];
    if (!validTypes.includes(categoryType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    // Deactivate all featured categories of this type
    const result = await FeaturedCategoryModel.updateMany(
      { categoryType, isActive: true },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `Featured category for ${categoryType} cleared successfully`,
      data: {
        deactivatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error clearing featured category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear featured category",
      error: error.message,
    });
  }
};

module.exports = clearFeaturedCategory;
