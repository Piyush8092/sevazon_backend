let userModel = require("../../model/userModel");

const queryAdminUser = async (req, res) => {
  try {
    let query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const result = await userModel
      .find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
      .skip(skip)
      .limit(limit);
    const total = await userModel.countDocuments({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Users retrieved successfully",
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
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { queryAdminUser };
