let NewsPostModel = require("../../model/NewsPost");
let userModel = require("../../model/userModel");

const getAllNews = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let location = req.query.location; // Optional location filter
    let excludeOwn = req.query.excludeOwn === "true"; // Optional flag to exclude own news
    const skip = (page - 1) * limit;

    // Build query filter
    let queryFilter = {};

    // Only exclude own news if explicitly requested
    if (excludeOwn && req.user && req.user._id) {
      queryFilter.userId = { $nin: [req.user._id] };
    }

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

    const result = await NewsPostModel.find(queryFilter)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email profileImage");
    const total = await NewsPostModel.countDocuments(queryFilter);
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "News retrieved successfully",
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
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAllNews };
