const LocalServiceModel = require("../../model/localServices");

const LocalServiceCreaterView = async (req, res) => {
  try {
    let userId = req.user._id;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await LocalServiceModel.find({ userId: userId }).skip(skip).limit(limit);
    const total = await LocalServiceModel.countDocuments({ userId: userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "local sevice retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
      currentPage: parseInt(page),
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

module.exports = { LocalServiceCreaterView };
