let jobModel = require("../../model/jobmodel");

const getReportAndBlockJobProfile = async (req, res) => {
  try {
    let userId = req.user._id;
    let result = await jobModel
      .find({
        reportAndBlock: {
          $elemMatch: {
            reportAndBlockID: userId,
            block: true,
          },
        },
      })
      .populate("userId", "name email phone profileImage ");
    if (!result || result.length === 0) {
      return res.json({
        message: "No blocked profiles found",
        status: 404,
        data: [],
        success: false,
        error: true,
      });
    }
    res.json({
      message: "Blocked job profiles retrieved successfully",
      status: 200,
      data: result,
      total: result.length,
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

module.exports = { getReportAndBlockJobProfile };
