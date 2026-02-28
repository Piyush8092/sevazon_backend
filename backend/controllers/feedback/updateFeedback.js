const FeedbackModel = require("../../model/feedbackModel");

const updateFeedback = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    // Check if feedback exists
    const existingFeedback = await FeedbackModel.findById(id);
    if (!existingFeedback) {
      return res.status(404).json({
        message: "Feedback not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    // Only admin can update feedback
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        status: 403,
        success: false,
        error: true,
      });
    }

    // If status is being changed to 'reviewed' or 'resolved', update reviewedBy and reviewedAt
    if (payload.status && payload.status !== "new" && existingFeedback.status === "new") {
      payload.reviewedBy = req.user._id;
      payload.reviewedAt = new Date();
    }

    const result = await FeedbackModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("userId", "name email phone")
      .populate("reviewedBy", "name email");

    res.json({
      message: "Feedback updated successfully",
      status: 200,
      data: result,
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

module.exports = { updateFeedback };
