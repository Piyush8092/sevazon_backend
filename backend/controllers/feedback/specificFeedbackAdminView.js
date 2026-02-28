let FeedbackModel = require("../../model/feedbackModel");

const specificFeedbackAdminView = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await FeedbackModel.find({ userId: id });
    if (!result) {
      res.json({ message: "No data found", status: 400, data: {}, success: false, error: true });
    }
    res.json({
      message: "Feedback detail retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
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

module.exports = { specificFeedbackAdminView };
