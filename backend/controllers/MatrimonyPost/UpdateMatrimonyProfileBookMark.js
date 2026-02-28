const MatrimonyModel = require("../../model/Matrimony");
const userModel = require("../../model/userModel");

const UpdateMatrimonyProfileBookMark = async (req, res) => {
  try {
    const { matrimonyProfileBookmarkID } = req.body;

    let userId = req.user._id;

    // Check if the matrimony profile exists
    const existingMatrimony = await MatrimonyModel.findById(matrimonyProfileBookmarkID);
    if (!existingMatrimony) {
      return res.status(404).json({
        message: "Matrimony profile not found",
        success: false,
        error: true,
      });
    }
    if (userId.toString() === existingMatrimony.userId.toString()) {
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

    // Check if the matrimony profile is already bookmarked
    const isBookmarked = user.matrimonyProfileBookmarkID.includes(matrimonyProfileBookmarkID);

    if (isBookmarked) {
      // Remove bookmark if it exists
      user.matrimonyProfileBookmarkID.pull(matrimonyProfileBookmarkID);
    } else {
      // Add bookmark if it doesn't exist
      user.matrimonyProfileBookmarkID.push(matrimonyProfileBookmarkID);
    }

    const result = await user.save();

    res.status(200).json({
      message: isBookmarked
        ? "Matrimony bookmark removed successfully"
        : "Matrimony bookmark added successfully",
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

module.exports = { UpdateMatrimonyProfileBookMark };
