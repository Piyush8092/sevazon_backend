let ApplyJob = require("../../model/ApplyModel");

const getSpecificApplyJob = async (req, res) => {
  try {
    let apply_id = req.params.apply_id;

    const result = await ApplyJob.find({ _id: apply_id });
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

module.exports = { getSpecificApplyJob };
