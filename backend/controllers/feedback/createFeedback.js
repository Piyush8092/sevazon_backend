const FeedbackModel = require("../../model/feedbackModel");

const createFeedback = async (req, res) => {
  try {
    const payload = req.body;

    // Validate required fields - only message is required from user input
    if (!payload.message) {
      return res.status(400).json({
        message: "Feedback message is required",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Auto-populate email and phone from authenticated user's registration data
    payload.userId = req.user._id;
    payload.email = req.user.email;
    payload.phone = req.user.phone;

    // Validate that user has email and phone in their profile
    if (!payload.email || !payload.phone) {
      return res.status(400).json({
        message: "User profile must have email and phone number to submit feedback",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Create new feedback
    const newFeedback = new FeedbackModel(payload);
    const result = await newFeedback.save();

    // Populate user details
    await result.populate("userId", "name email phone");

    res.json({
      message: "Feedback submitted successfully",
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

module.exports = { createFeedback };
