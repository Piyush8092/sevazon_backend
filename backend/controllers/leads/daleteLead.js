let leadModel = require("../../model/leadModel");

const deleteLead = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;

    let ExistLead = await leadModel.findById(id);
    if (!ExistLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (ExistLead.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const result = await leadModel.findByIdAndDelete(id);

    res.json({
      message: "Lead deleted successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { deleteLead };
