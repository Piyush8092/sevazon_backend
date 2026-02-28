let MatrimonyModel = require("../../model/Matrimony");

const getTotalMatrimonyCount = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "not auth,something went wrong",
        status: 500,
        success: false,
        error: true,
      });
    }
    let totalMatrimonyCount = await MatrimonyModel.countDocuments();
    res.json({
      message: "Total matrimony count retrieved successfully",
      status: 200,
      data: totalMatrimonyCount,
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

module.exports = { getTotalMatrimonyCount };
