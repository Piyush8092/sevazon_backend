let NewsPostModel = require("../../model/NewsPost");

const NewsEditorView = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    let userId = req.user._id;
    const result = await NewsPostModel.find({ userId: userId })
      .populate("userId", "name profileImage verified")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    const total = await NewsPostModel.countDocuments({ userId: userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Published news retrieved successfully",
      status: 200,
      news: result, // Match frontend expectation
      data: result, // Keep data key for backward compatibility if any
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

module.exports = { NewsEditorView };
