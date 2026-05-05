let Lead = require("../../model/leadModel");

const getAllLeadsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        status: 403,
        data: {},
        success: false,
        error: true,
      });
    }

    const totalLeads = await Lead.countDocuments({});
    const leads = await Lead.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email pincode district");

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total: totalLeads,
        page,
        limit,
        totalPages: Math.ceil(totalLeads / limit),
      },
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { getAllLeadsAdmin };
