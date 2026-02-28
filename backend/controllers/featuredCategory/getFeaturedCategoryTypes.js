const FeaturedCategoryTypeModel = require("../../model/FeaturedCategoryTypeModel");

/**
 * Get all featured category types with their labels
 * Public endpoint - no authentication required
 */
const getFeaturedCategoryTypes = async (req, res) => {
  try {
    // Find all category types
    let categoryTypes = await FeaturedCategoryTypeModel.find({ isActive: true }).sort({
      displayOrder: 1,
    });

    // If no types exist in DB, create default ones
    if (categoryTypes.length === 0) {
      const defaultTypes = [
        {
          typeKey: "seasonal",
          label: "Seasonal Category",
          description: "Featured seasonal category (e.g., Monsoon Special)",
          displayOrder: 0,
          isActive: true,
        },
        {
          typeKey: "wedding",
          label: "Wedding & Events",
          description: "Featured wedding and events category",
          displayOrder: 1,
          isActive: true,
        },
        {
          typeKey: "education",
          label: "Education & Learning",
          description: "Featured education and learning category",
          displayOrder: 2,
          isActive: true,
        },
      ];

      categoryTypes = await FeaturedCategoryTypeModel.insertMany(defaultTypes);
    }

    res.status(200).json({
      success: true,
      message: "Featured category types fetched successfully",
      data: categoryTypes,
    });
  } catch (error) {
    console.error("Error fetching featured category types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured category types",
      error: error.message,
    });
  }
};

module.exports = getFeaturedCategoryTypes;
