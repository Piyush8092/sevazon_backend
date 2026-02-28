let ApplyJob = require("../../model/ApplyModel");

const getApplyedJob = async (req, res) => {
  try {
    let userId = req.user._id;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await ApplyJob.find({ ApplyuserId: userId })
      .populate(
        "jobId",
        "title yourNameBusinessInstituteFirmCompany selectCategory selectSubCategory address pincode city state workType"
      )
      .populate("ApplyuserId", "name email phone")
      .populate("job_creatorId", "name email phone")
      .skip(skip)
      .limit(limit);

    const total = await ApplyJob.countDocuments({ ApplyuserId: userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Applications retrieved successfully",
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

module.exports = { getApplyedJob };
