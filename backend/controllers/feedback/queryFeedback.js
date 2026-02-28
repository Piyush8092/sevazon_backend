const FeedbackModel = require("../../model/feedbackModel");

const queryFeedback = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({
        message: "Query parameter is required",
        status: 400,
        success: false,
        error: true,
      });
    }

    const regexQuery = new RegExp(query, "i");
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    // Search across multiple fields
    const searchQuery = {
      $or: [
        { email: regexQuery },
        { phone: regexQuery },
        { message: regexQuery },
        { status: regexQuery },
      ],
    };

    const result = await FeedbackModel.find(searchQuery)
      .populate("userId", "name email phone")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeedbackModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Feedback search results",
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

module.exports = { queryFeedback };
