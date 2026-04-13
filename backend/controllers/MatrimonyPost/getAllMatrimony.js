let MatrimonyModel = require("../../model/Matrimony");

const getAllMatrimony = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    // Build query filter - exclude current user's matrimony profiles if user is logged in
    let queryFilter = {};

    // Populate applyMatrimony.applyUserId and userId for frontend checking and chat
    const result = await MatrimonyModel.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "_id name email phone postFeatures")
      .populate("applyMatrimony.applyUserId", "_id name email phone");

    const total = await MatrimonyModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Matrimony profiles retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAllMatrimony };
