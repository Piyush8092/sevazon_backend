const FeedbackModel = require("../../model/feedbackModel");

const deleteFeedback = async (req, res) => {
  try {
    const id = req.params.id;

    const existingFeedback = await FeedbackModel.findById(id);
    if (!existingFeedback) {
      return res.status(404).json({
        message: "Feedback not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Only admin can delete feedback
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        status: 403,
        success: false,
        error: true,
      });
    }

    await FeedbackModel.findByIdAndDelete(id);

    res.json({
      message: "Feedback deleted successfully",
      status: 200,
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

module.exports = { deleteFeedback };
