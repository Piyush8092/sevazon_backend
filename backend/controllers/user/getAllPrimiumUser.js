let userModel = require("../../model/userModel");

const getAllPrimiumUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.json({
        message: "not auth,something went wrong",
        status: 500,
        success: false,
        error: true,
      });
    }
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await userModel.find({ primiumUser: true }).skip(skip).limit(limit);
    const total = await userModel.countDocuments({ primiumUser: true });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Primium users retrieved successfully",
      status: 200,
      data: result,
      total,
      totalPages,
      currentPage: page,
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

module.exports = { getAllPrimiumUser };
