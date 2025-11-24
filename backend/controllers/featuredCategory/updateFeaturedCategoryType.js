const FeaturedCategoryTypeModel = require('../../model/FeaturedCategoryTypeModel');

/**
 * Update a featured category type's label and description
 * Admin only endpoint - requires authentication
 */
const updateFeaturedCategoryType = async (req, res) => {
  try {
    const { typeKey, label, description } = req.body;

    // Validate required fields
    if (!typeKey || !label) {
      return res.status(400).json({
        success: false,
        message: 'Type key and label are required',
      });
    }

    // Validate type key
    const validTypes = ['seasonal', 'wedding', 'education'];
    if (!validTypes.includes(typeKey)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type key. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Find and update the category type
    let categoryType = await FeaturedCategoryTypeModel.findOne({ typeKey });

    if (!categoryType) {
      // Create new if doesn't exist
      categoryType = new FeaturedCategoryTypeModel({
        typeKey,
        label,
        description: description || '',
        isActive: true,
      });
    } else {
      // Update existing
      categoryType.label = label;
      if (description !== undefined) {
        categoryType.description = description;
      }
    }

    await categoryType.save();

    res.status(200).json({
      success: true,
      message: 'Featured category type updated successfully',
      data: categoryType,
    });
  } catch (error) {
    console.error('Error updating featured category type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update featured category type',
      error: error.message,
    });
  }
};

module.exports = updateFeaturedCategoryType;

