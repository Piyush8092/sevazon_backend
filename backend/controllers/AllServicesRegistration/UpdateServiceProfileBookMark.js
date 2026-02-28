const createServiceModel = require("../../model/createAllServiceProfileModel");
const userModel = require("../../model/userModel");

const UpdateServiceProfileBookMark = async (req, res) => {
  try {
    const { serviceProfileBookmarkID } = req.body;

    let userId = req.user._id;

    // Check if the service profile exists
    const existingService = await createServiceModel.findById(serviceProfileBookmarkID);
    if (!existingService) {
      return res.status(404).json({
        message: "Service profile not found",
        success: false,
        error: true,
      });
    }
    if (userId.toString() === existingService.userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot bookmark your own profile", success: false, error: true });
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

    // Check if the service is already bookmarked
    const isBookmarked = user.serviceProfileBookmarkID.includes(serviceProfileBookmarkID);

    if (isBookmarked) {
      // Remove bookmark if it exists
      user.serviceProfileBookmarkID.pull(serviceProfileBookmarkID);
    } else {
      // Add bookmark if it doesn't exist
      user.serviceProfileBookmarkID.push(serviceProfileBookmarkID);
    }

    const result = await user.save();

    res.status(200).json({
      message: isBookmarked ? "Bookmark removed successfully" : "Bookmark added successfully",
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

module.exports = { UpdateServiceProfileBookMark };
