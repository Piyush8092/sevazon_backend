const jobModel = require("../../model/jobmodel");
const userModel = require("../../model/userModel");

const UpdateJobProfileBookMark = async (req, res) => {
  try {
    const { jobProfileBookmarkID } = req.body;

    let userId = req.user._id;
    if (userId.toString() === jobProfileBookmarkID.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot bookmark your own job", success: false, error: true });
    }
    // Check if the job exists
    const existingJob = await jobModel.findById(jobProfileBookmarkID);
    if (!existingJob) {
      return res.status(404).json({
        message: "Job not found",
        success: false,
        error: true,
      });
    }

    // Find the logged-in user
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
        error: true,
      });
    }

    // Check if the job is already bookmarked
    const isBookmarked = user.jobProfileBookmarkID.includes(jobProfileBookmarkID);

    if (isBookmarked) {
      // Remove bookmark if it exists
      user.jobProfileBookmarkID.pull(jobProfileBookmarkID);
    } else {
      // Add bookmark if it doesn't exist
      user.jobProfileBookmarkID.push(jobProfileBookmarkID);
    }

    const result = await user.save();

    res.status(200).json({
      message: isBookmarked
        ? "Job bookmark removed successfully"
        : "Job bookmark added successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { UpdateJobProfileBookMark };
