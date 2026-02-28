let ApplyModel = require("../../model/ApplyModel");

const updateApplyStatusByCreater = async (req, res) => {
  try {
    let apply_id = req.params.apply_id;
    let payload = req.body;

    let ExistApplicaton = await ApplyModel.findById(apply_id);
    if (!ExistApplicaton) {
      return res.status(400).json({ message: "Application not found" });
    }

    let Created_userId = ExistApplicaton.job_creatorId;
    const userId = req.user._id;

    if (Created_userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Only allow accept_status changes by job creator or admin
    if (
      payload.accept_status &&
      !["Pending", "Accepted", "Rejected"].includes(payload.accept_status)
    ) {
      return res.status(400).json({ message: "Invalid accept_status value" });
    }

    let result = await ApplyModel.findByIdAndUpdate({ _id: apply_id }, payload, { new: true });
    res.json({
      message: "Application updated successfully",
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

module.exports = { updateApplyStatusByCreater };
