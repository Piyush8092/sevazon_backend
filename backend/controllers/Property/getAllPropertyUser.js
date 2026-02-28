let PropertyModel = require("../../model/property");

const getAllPropertyUser = async (req, res) => {
  try {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;
    const result = await PropertyModel.find()
      .skip(skip)
      .limit(limit)
      .populate("profileId", "profileType");
    const total = await PropertyModel.countDocuments();
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Property created successfully",
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

module.exports = { getAllPropertyUser };
