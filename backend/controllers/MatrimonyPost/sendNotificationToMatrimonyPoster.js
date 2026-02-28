let MatrimonyModel = require("../../model/Matrimony");
let userModel = require("../../model/userModel");

const sendNotificationToMatrimonyPoster = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "Not authorized",
        status: 500,
        success: false,
        error: true,
      });
    }
    // Get all users used in matrimony table
    const matrimonyUsers = await MatrimonyModel.distinct("userId");
    // Find only users not used in matrimony model
    const result = await userModel.find(
      { _id: { $nin: matrimonyUsers } },
      { _id: 1, name: 1, email: 1, phone: 1 } // return only 4 fields
    );

    res.json({
      message: "Users without matrimony fetched",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
      status: 500,
      data: error.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { sendNotificationToMatrimonyPoster };
