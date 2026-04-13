let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");

const getTrendingNews = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let location = req.query.location; // Optional location filter
    const skip = (page - 1) * limit;

    // Build query filter
    let queryFilter = {};

    // Add location filter if provided
    if (location) {
      queryFilter.location = location;
    }

    // Get user's blocked authors list
    if (req.user && req.user._id) {
      const user = await userModel.findById(req.user._id).select("blockedNewsAuthors");
      if (user && user.blockedNewsAuthors && user.blockedNewsAuthors.length > 0) {
        // Exclude news from blocked authors
        if (queryFilter.userId) {
          // Merge with existing userId filter
          queryFilter.userId.$nin = [
            ...(queryFilter.userId.$nin || []),
            ...user.blockedNewsAuthors,
          ];
        } else {
          queryFilter.userId = { $nin: user.blockedNewsAuthors };
        }
      }
    }

    // Fetch all news matching the filter
    const allNews = await NewsPostModel.find(queryFilter).populate(
      "userId",
      "name email profileImage"
    );

    // Calculate total reactions for each news post and sort by it
    const newsWithReactionCount = allNews.map((news) => {
      const totalReactions = (news.emojiReactions && news.emojiReactions.length) || 0;
      return {
        news: news,
        totalReactions: totalReactions,
      };
    });

    // Sort by total reactions (descending - highest first)
    newsWithReactionCount.sort((a, b) => b.totalReactions - a.totalReactions);

    // Apply pagination after sorting
    const paginatedNews = newsWithReactionCount.slice(skip, skip + parseInt(limit));
    const result = paginatedNews.map((item) => item.news);

    const total = newsWithReactionCount.length;
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Trending news retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
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

module.exports = { getTrendingNews };
