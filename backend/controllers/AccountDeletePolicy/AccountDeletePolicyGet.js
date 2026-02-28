let AccountDeletionModel = require("../../model/AccountDeletionModel");

const getAccountDeletePolicy = async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    let page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const result = await AccountDeletionModel.find().skip(skip).limit(limit);
    const total = await AccountDeletionModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Account deletion policy retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAccountDeletePolicy };
