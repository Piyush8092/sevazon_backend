const FeaturedCategoryModel = require('../../model/FeaturedCategoryModel');

/**
 * Get all active featured categories
 * Public endpoint - no authentication required
 */
const getFeaturedCategories = async (req, res) => {
  try {
    // Find all active featured categories
    const featuredCategories = await FeaturedCategoryModel.find({ isActive: true })
      .populate({
        path: 'categoryId',
        select: 'name image subService',
        populate: {
          path: 'subService',
          select: 'name image',
        },
      })
      .sort({ displayOrder: 1, createdAt: -1 });

    // Check for expired categories and deactivate them
    const now = new Date();
    const updates = [];
    
    for (const category of featuredCategories) {
      if (category.endDate && now > category.endDate) {
        category.isActive = false;
        updates.push(category.save());
      }
    }
    
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // Filter out expired categories
    const activeCategories = featuredCategories.filter(cat => cat.isActive);

    // Format response by category type
    const response = {
      seasonal: null,
      wedding: null,
      education: null,
    };

    activeCategories.forEach(category => {
      response[category.categoryType] = {
        _id: category._id,
        categoryType: category.categoryType,
        categoryId: category.categoryId?._id || category.categoryId,
        categoryName: category.categoryName,
        categoryImage: category.categoryImage,
        category: category.categoryId, // Full populated category data
        selectedSubcategories: category.selectedSubcategories || [],
        startDate: category.startDate,
        endDate: category.endDate,
        displayOrder: category.displayOrder,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Featured categories fetched successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured categories',
      error: error.message,
    });
  }
};

module.exports = getFeaturedCategories;

