const serviceListModel = require("../../model/ServiceListModel");

const GetAllServiceList = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const hasLimit = req.query.limit !== undefined;
    const limit = hasLimit ? Math.max(parseInt(req.query.limit, 10) || 10, 1) : null;
    const skip = limit ? (page - 1) * limit : 0;

    let query = serviceListModel.find().sort({ createdAt: 1 });

    if (limit) {
      query = query.skip(skip).limit(limit);
    }

    const result = await query;
    const total = await serviceListModel.countDocuments();
    const totalPages = limit ? Math.ceil(total / limit) : total > 0 ? 1 : 0;

    res.json({
      message: "Service List created successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalItems: total,
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

module.exports = { GetAllServiceList };
