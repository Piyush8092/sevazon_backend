const SeasonalCategoryModel = require("../../model/SeasonalCategoryModel");
const serviceListModel = require("../../model/ServiceListModel");

/**
 * Set a new seasonal category (Admin only)
 * This will deactivate any existing seasonal category and set a new one
 */
const setSeasonalCategory = async (req, res) => {
  try {
    const { categoryId, startDate, endDate } = req.body;

    // Validate required fields
    if (!categoryId) {
      return res.status(400).json({
        message: "Category ID is required",
        status: 400,
        data: null,
        success: false,
        error: true,
      });
    }

    // Verify that the category exists
    const category = await serviceListModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
        status: 404,
        data: null,
        success: false,
        error: true,
      });
    }

    // Deactivate all existing seasonal categories
    await SeasonalCategoryModel.updateMany({ isActive: true }, { isActive: false });

    // Create new seasonal category
    const newSeasonalCategory = new SeasonalCategoryModel({
      categoryId: categoryId,
      categoryName: category.name,
      categoryImage: category.image,
      isActive: true,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      setBy: req.user._id, // From auth middleware
    });

    const result = await newSeasonalCategory.save();

    res.json({
      message: "Seasonal category set successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { setSeasonalCategory };
