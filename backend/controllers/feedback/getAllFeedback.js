const FeedbackModel = require("../../model/feedbackModel");

const getAllFeedback = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    // Build query based on status filter if provided
    let query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const result = await FeedbackModel.find(query)
      .populate("userId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeedbackModel.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Feedback retrieved successfully",
      status: 200,
      data: result,
      total,
      totalPages,
      currentPage: parseInt(page),
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

module.exports = { getAllFeedback };
