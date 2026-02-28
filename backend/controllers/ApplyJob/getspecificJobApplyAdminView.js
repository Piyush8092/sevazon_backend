let ApplyJob = require("../../model/ApplyModel");

const getspecificJobApplyAdminView = async (req, res) => {
  try {
    let job_id = req.params.job_id;
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    let result = await ApplyJob.find({ jobId: job_id });
    if (!result) {
      res.json({ message: "No data found", status: 400, data: {}, success: false, error: true });
    }
    res.json({
      message: "Job created successfully",
      status: 200,
      data: result,
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

module.exports = { getspecificJobApplyAdminView };
