const FeaturedCategoryModel = require('../../model/FeaturedCategoryModel');
const serviceListModel = require('../../model/ServiceListModel');

/**
 * Set a featured category for a specific type
 * Admin only endpoint - requires authentication
 */
const setFeaturedCategory = async (req, res) => {
  try {
    const { categoryType, categoryId, subcategoryIds, startDate, endDate, displayOrder } = req.body;

    // Validate required fields
    if (!categoryType || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category type and category ID are required',
      });
    }

    // Validate category type
    const validTypes = ['seasonal', 'wedding', 'education'];
    if (!validTypes.includes(categoryType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Check if the category exists
    const category = await serviceListModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Process selected subcategories
    let selectedSubcategories = [];
    if (subcategoryIds && Array.isArray(subcategoryIds) && subcategoryIds.length > 0) {
      // Filter subcategories that exist in the category's subService array
      selectedSubcategories = category.subService.filter(sub =>
        subcategoryIds.includes(sub._id.toString())
      ).map(sub => ({
        _id: sub._id,
        name: sub.name,
        image: sub.image || '',
      }));
    }

    // Deactivate any existing featured category of this type
    await FeaturedCategoryModel.updateMany(
      { categoryType, isActive: true },
      { isActive: false }
    );

    // Create new featured category
    const featuredCategory = new FeaturedCategoryModel({
      categoryType,
      categoryId,
      categoryName: category.name,
      categoryImage: category.image || '',
      selectedSubcategories,
      isActive: true,
      startDate: startDate || null,
      endDate: endDate || null,
      setBy: req.user?.email || req.user?.name || 'admin',
      displayOrder: displayOrder || 0,
    });

    await featuredCategory.save();

    // Populate the category data before sending response
    await featuredCategory.populate({
      path: 'categoryId',
      select: 'name image subService',
    });

    res.status(200).json({
      success: true,
      message: `Featured category for ${categoryType} set successfully`,
      data: {
        _id: featuredCategory._id,
        categoryType: featuredCategory.categoryType,
        categoryId: featuredCategory.categoryId._id,
        categoryName: featuredCategory.categoryName,
        categoryImage: featuredCategory.categoryImage,
        selectedSubcategories: featuredCategory.selectedSubcategories,
        startDate: featuredCategory.startDate,
        endDate: featuredCategory.endDate,
        displayOrder: featuredCategory.displayOrder,
      },
    });
  } catch (error) {
    console.error('Error setting featured category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set featured category',
      error: error.message,
    });
  }
};

module.exports = setFeaturedCategory;

