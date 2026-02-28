let LocalServiceModel = require("../../model/localServices");

const getTotalLocalServicesCount = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "not auth,something went wrong",
        status: 500,
        success: false,
        error: true,
      });
    }
    let totalLocalServicesCount = await LocalServiceModel.countDocuments();
    res.json({
      message: "Total local services count retrieved successfully",
      status: 200,
      data: totalLocalServicesCount,
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

module.exports = { getTotalLocalServicesCount };
