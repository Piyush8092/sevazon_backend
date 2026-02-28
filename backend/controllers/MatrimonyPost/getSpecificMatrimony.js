let MatrimonyModel = require("../../model/Matrimony");

const getSpecificMatrimony = async (req, res) => {
  try {
    let id = req.params.id;

    // Populate applyMatrimony.applyUserId and userId for frontend checking and chat
    let result = await MatrimonyModel.findById({ _id: id })
      .populate("userId", "_id name email phone")
      .populate("applyMatrimony.applyUserId", "_id name email phone");

    if (!result) {
      return res
        .status(404)
        .json({
          message: "Matrimony profile not found",
          status: 404,
          data: {},
          success: false,
          error: true,
        });
    }
    res.json({
      message: "Matrimony profile retrieved successfully",
      status: 200,
      data: result,
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

module.exports = { getSpecificMatrimony };
