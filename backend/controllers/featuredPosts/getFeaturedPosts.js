const FeaturedPostsModel = require("../../model/FeaturedPostsModel");
const jobModel = require("../../model/jobmodel");
const MatrimonyModel = require("../../model/Matrimony");
const adModel = require("../../model/adModel");
const PropertyModel = require("../../model/property");

/**
 * Get active featured posts configuration
 * Public endpoint - no authentication required
 *
 * Returns featured posts with full post data from different post types
 */
const getFeaturedPosts = async (req, res) => {
  try {
    // Find active featured posts configuration
    const featuredPostsConfig = await FeaturedPostsModel.findOne({ isActive: true }).sort({
      createdAt: -1,
    });

    // If no configuration exists, return empty array
    if (!featuredPostsConfig) {
      return res.status(200).json({
        success: true,
        message: "No featured posts configured",
        data: {
          posts: [],
          totalCount: 0,
        },
      });
    }

    // Check if configuration has expired
    if (featuredPostsConfig.isExpired()) {
      featuredPostsConfig.isActive = false;
      await featuredPostsConfig.save();

      return res.status(200).json({
        success: true,
        message: "Featured posts configuration has expired",
        data: {
          posts: [],
          totalCount: 0,
        },
      });
    }

    // Fetch full post data for each selected post
    const postsWithData = [];

    for (const selectedPost of featuredPostsConfig.selectedPosts) {
      try {
        let postData = null;

        // Fetch post based on type
        switch (selectedPost.postType) {
          case "job":
            postData = await jobModel
              .findById(selectedPost.postId)
              .populate("userId", "name email profileImage")
              .populate("profileId", "displayName profileImage");
            break;

          case "matrimony":
            postData = await MatrimonyModel.findById(selectedPost.postId).populate(
              "userId",
              "name email profileImage"
            );
            break;

          case "ad":
            postData = await adModel
              .findById(selectedPost.postId)
              .populate("userId", "name email profileImage");
            break;

          case "property":
            postData = await PropertyModel.findById(selectedPost.postId)
              .populate("userId", "name email profileImage")
              .populate("profileId", "displayName profileImage");
            break;
        }

        // Only include if post still exists and is active
        if (postData && postData.isActive) {
          postsWithData.push({
            postType: selectedPost.postType,
            postId: selectedPost.postId,
            displayOrder: selectedPost.displayOrder,
            addedAt: selectedPost.addedAt,
            postData: postData,
          });
        }
      } catch (error) {
        console.error(
          `Error fetching ${selectedPost.postType} post ${selectedPost.postId}:`,
          error
        );
        // Continue with other posts even if one fails
      }
    }

    // Sort by display order
    postsWithData.sort((a, b) => a.displayOrder - b.displayOrder);

    res.status(200).json({
      success: true,
      message: "Featured posts fetched successfully",
      data: {
        posts: postsWithData,
        totalCount: postsWithData.length,
        configId: featuredPostsConfig._id,
        startDate: featuredPostsConfig.startDate,
        endDate: featuredPostsConfig.endDate,
        setBy: featuredPostsConfig.setBy,
        lastUpdated: featuredPostsConfig.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured posts",
      error: error.message,
    });
  }
};

module.exports = getFeaturedPosts;
