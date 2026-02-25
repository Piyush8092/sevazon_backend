const FeaturedPostsModel = require('../../model/FeaturedPostsModel');
const jobModel = require('../../model/jobmodel');
const MatrimonyModel = require('../../model/Matrimony');
const adModel = require('../../model/adModel');
const PropertyModel = require('../../model/property');

/**
 * Set featured posts configuration
 * Admin only endpoint - requires authentication
 *
 * Request body:
 * - postSelections: Array of { postType, postId, displayOrder }
 * - startDate, endDate: Optional
 */
const setFeaturedPosts = async (req, res) => {
  try {
    const {
      postSelections,
      startDate,
      endDate,
    } = req.body;

    // Validate input
    if (!postSelections || !Array.isArray(postSelections)) {
      return res.status(400).json({
        success: false,
        message: 'postSelections must be an array',
      });
    }

    // Validate and fetch each selected post
    const validatedPosts = [];
    const validPostTypes = ['jobs', 'matrimony', 'ads', 'property'];

    for (let i = 0; i < postSelections.length; i++) {
      const selection = postSelections[i];
      
      // Validate post type
      if (!validPostTypes.includes(selection.postType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid post type: ${selection.postType}. Must be one of: ${validPostTypes.join(', ')}`,
        });
      }

      // Validate post ID
      if (!selection.postId) {
        return res.status(400).json({
          success: false,
          message: `Post ID is required for selection at index ${i}`,
        });
      }

      // Verify post exists
      let postExists = false;
      let postData = null;

      try {
        switch (selection.postType) {
          case 'job':
            postData = await jobModel.findById(selection.postId);
            break;
          case 'matrimony':
            postData = await MatrimonyModel.findById(selection.postId);
            break;
          case 'ad':
            postData = await adModel.findById(selection.postId);
            break;
          case 'property':
            postData = await PropertyModel.findById(selection.postId);
            break;
        }

        postExists = postData !== null;
      } catch (error) {
        console.error(`Error validating ${selection.postType} post ${selection.postId}:`, error);
      }

      if (!postExists) {
        return res.status(404).json({
          success: false,
          message: `${selection.postType} post with ID ${selection.postId} not found`,
        });
      }

      // Add to validated posts
      validatedPosts.push({
        postType: selection.postType,
        postId: selection.postId,
        postData: {
          title: postData.title || postData.jobTitle || postData.propertyType || 'Untitled',
          // Store minimal data for quick reference
        },
        displayOrder: selection.displayOrder || i,
        addedAt: new Date(),
      });
    }

    // Deactivate any existing featured posts configuration
    await FeaturedPostsModel.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Create new featured posts configuration
    const featuredPosts = new FeaturedPostsModel({
      selectedPosts: validatedPosts,
      isActive: true,
      startDate: startDate || null,
      endDate: endDate || null,
      setBy: req.user?.email || req.user?.name || 'admin',
    });

    await featuredPosts.save();

    res.status(201).json({
      success: true,
      message: 'Featured posts configured successfully',
      data: {
        _id: featuredPosts._id,
        totalPosts: validatedPosts.length,
        postsByType: {
          job: validatedPosts.filter(p => p.postType === 'job').length,
          matrimony: validatedPosts.filter(p => p.postType === 'matrimony').length,
          ad: validatedPosts.filter(p => p.postType === 'ad').length,
          property: validatedPosts.filter(p => p.postType === 'property').length,
        },
        startDate: featuredPosts.startDate,
        endDate: featuredPosts.endDate,
        setBy: featuredPosts.setBy,
      },
    });
  } catch (error) {
    console.error('Error setting featured posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set featured posts',
      error: error.message,
    });
  }
};

module.exports = setFeaturedPosts;

