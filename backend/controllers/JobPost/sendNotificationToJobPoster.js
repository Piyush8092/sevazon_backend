let jobModel = require("../../model/jobmodel");
let userModel = require("../../model/userModel");

const sendNotificationToJobPoster = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "Not authorized",
        status: 500,
        success: false,
        error: true,
      });
    }

    // Get all users used in job table
    const jobUsers = await jobModel.distinct("userId");

    // Find only users not used in job model
    const result = await userModel.find(
      { _id: { $nin: jobUsers } },
      { _id: 1, name: 1, email: 1, phone: 1 } // return only 4 fields
    );

    res.json({
      message: "Users without jobs fetched",
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

module.exports = { sendNotificationToJobPoster };
