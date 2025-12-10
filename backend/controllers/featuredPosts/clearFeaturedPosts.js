const FeaturedPostsModel = require('../../model/FeaturedPostsModel');

/**
 * Clear featured posts configuration
 * Admin only endpoint - requires authentication
 *
 * Deactivates the current featured posts configuration
 */
const clearFeaturedPosts = async (req, res) => {
  try {
    // Deactivate all featured posts configurations
    const result = await FeaturedPostsModel.updateMany(
      { isActive: true },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: 'Featured posts cleared successfully',
      data: {
        deactivatedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Error clearing featured posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear featured posts',
      error: error.message,
    });
  }
};

module.exports = clearFeaturedPosts;

