const userModel = require("../../model/userModel");

const decreaseUserViewContactNumbers = async (req, res) => {
  try {
    const userId = req.user._id;
    const type = req.params.type; // job | property | offer | matrimony

    // ✅ Validate type
    const allowedTypes = ["job", "property", "offer", "matrimony"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid contact type",
        success: false,
      });
    }

    // ✅ Check user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const fieldPath = `viewContactNumbers.${type}`;
    const currentValue = user.viewContactNumbers?.[type] || 0;

    // ❌ Prevent negative values
    if (currentValue <= 0) {
      return res.status(400).json({
        message: `No remaining ${type} contact views`,
        success: false,
      });
    }

    // ✅ Atomic decrement
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { [fieldPath]: -1 } },
      { new: true }
    );

    return res.json({
      message: `${type} contact view decreased successfully`,
      status: 200,
      data: updatedUser,
      success: true,
      error: false,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong",
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { decreaseUserViewContactNumbers };
