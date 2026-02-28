const FeaturedCategoryModel = require("../../model/FeaturedCategoryModel");
const serviceListModel = require("../../model/ServiceListModel");

/**
 * Set a featured category collection with subcategories from multiple categories
 * Admin only endpoint - requires authentication
 *
 * Request body:
 * - categoryType: 'seasonal' | 'wedding' | 'education'
 * - customName: Custom name for the collection (e.g., "Winter Special")
 * - customDescription: Optional description
 * - subcategorySelections: Array of { categoryId, subcategoryIds[] }
 * - startDate, endDate, displayOrder: Optional
 */
const setFeaturedCategory = async (req, res) => {
  try {
    const {
      categoryType,
      customName,
      customDescription,
      subcategorySelections,
      startDate,
      endDate,
      displayOrder,
    } = req.body;

    // Validate required fields
    if (!categoryType || !customName || !subcategorySelections) {
      return res.status(400).json({
        success: false,
        message: "Category type, custom name, and subcategory selections are required",
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

    // Validate subcategorySelections is an array
    if (!Array.isArray(subcategorySelections) || subcategorySelections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one subcategory selection is required",
      });
    }

    // Process subcategories from all selected categories
    const selectedSubcategories = [];

    for (const selection of subcategorySelections) {
      const { categoryId, subcategoryIds } = selection;

      if (!categoryId || !Array.isArray(subcategoryIds) || subcategoryIds.length === 0) {
        continue; // Skip invalid selections
      }

      // Fetch the category
      const category = await serviceListModel.findById(categoryId);
      if (!category) {
        continue; // Skip if category not found
      }

      // Find matching subcategories in this category
      const matchingSubcategories = category.subService
        .filter((sub) => subcategoryIds.includes(sub._id.toString()))
        .map((sub) => ({
          _id: sub._id,
          name: sub.name,
          image: sub.image || "",
          parentCategoryId: category._id,
          parentCategoryName: category.name,
        }));

      selectedSubcategories.push(...matchingSubcategories);
    }

    // Validate that we have at least one subcategory
    if (selectedSubcategories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid subcategories found. Please select at least one subcategory.",
      });
    }

    // Deactivate any existing featured category of this type
    await FeaturedCategoryModel.updateMany({ categoryType, isActive: true }, { isActive: false });

    // Create new featured category
    const featuredCategory = new FeaturedCategoryModel({
      categoryType,
      customName: customName.trim(),
      customDescription: customDescription?.trim() || "",
      selectedSubcategories,
      isActive: true,
      startDate: startDate || null,
      endDate: endDate || null,
      setBy: req.user?.email || req.user?.name || "admin",
      displayOrder: displayOrder || 0,
    });

    await featuredCategory.save();

    res.status(200).json({
      success: true,
      message: `Featured category "${customName}" for ${categoryType} set successfully`,
      data: {
        _id: featuredCategory._id,
        categoryType: featuredCategory.categoryType,
        customName: featuredCategory.customName,
        customDescription: featuredCategory.customDescription,
        selectedSubcategories: featuredCategory.selectedSubcategories,
        subcategoryCount: featuredCategory.selectedSubcategories.length,
        startDate: featuredCategory.startDate,
        endDate: featuredCategory.endDate,
        displayOrder: featuredCategory.displayOrder,
      },
    });
  } catch (error) {
    console.error("Error setting featured category:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set featured category",
      error: error.message,
    });
  }
};

module.exports = setFeaturedCategory;
