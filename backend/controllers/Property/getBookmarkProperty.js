const userModel = require("../../model/userModel");
const propertyModel = require("../../model/property");

const getBookmarkProperty = async (req, res) => {
  try {
    let userId = req.user._id;
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all bookmarked properties
    const bookmarkedProperties = await propertyModel.find({
      _id: { $in: user.propertyBookmarkID },
    });

    res.json({
      message: "Bookmarked properties retrieved successfully",
      status: 200,
      data: bookmarkedProperties,
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

module.exports = { getBookmarkProperty };
