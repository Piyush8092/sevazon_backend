const userModel = require("../../model/userModel");
const propertyModel = require("../../model/property");

const getReportAndBlockProperty = async (req, res) => {
  try {
    let userId = req.user._id;
    let user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all reported and blocked properties
    const reportedProperties = await propertyModel.find({
      _id: { $in: user.propertyReportAndBlockID },
    });

    res.json({
      message: "Reported and blocked properties retrieved successfully",
      status: 200,
      data: reportedProperties,
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

module.exports = { getReportAndBlockProperty };
