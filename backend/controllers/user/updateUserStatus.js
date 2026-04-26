const userModel = require("../../model/userModel");

/**
 * Updates the user's online status and last seen timestamp
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const { isOnline } = req.body;

    const updateData = {
      isOnline: isOnline === true,
      lastSeen: new Date()
    };

    // Also update LastLoginTime for backward compatibility
    if (isOnline === true) {
      updateData.LastLoginTime = new Date().toISOString();
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    res.status(200).json({
      message: "User status updated successfully",
      success: true,
      data: {
        isOnline: updatedUser.isOnline,
        lastSeen: updatedUser.lastSeen
      }
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      error: error.message
    });
  }
};

module.exports = { updateUserStatus };
