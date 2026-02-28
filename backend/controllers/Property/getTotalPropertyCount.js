let PropertyModel = require("../../model/property");

const getTotalPropertyCount = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "not auth,something went wrong",
        status: 500,
        success: false,
        error: true,
      });
    }
    let totalPropertyCount = await PropertyModel.countDocuments();
    res.json({
      message: "Total property count retrieved successfully",
      status: 200,
      data: totalPropertyCount,
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

module.exports = { getTotalPropertyCount };
