let contactModel = require("../../model/contactModel");

const getContact = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await contactModel.find().skip(skip).limit(parseInt(limit));
    const total = await contactModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Contact retrieved successfully",
      status: 200,
      data: result,
      total,
      totalPages,
      currentPage: parseInt(page),
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

module.exports = { getContact };
