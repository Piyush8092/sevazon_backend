let MatrimonyModel = require("../../model/Matrimony");

const acceptMatrimony = async (req, res) => {
  try {
    const id = req.params.id;
    const index = parseInt(req.params.index);
    const { accept } = req.body;
    const userId = req.user._id;

    const existMatrimony = await MatrimonyModel.findById(id);
    if (!existMatrimony) {
      return res.status(400).json({ message: "Profile not found" });
    }

    // Only profile owner or admin can accept/reject
    if (existMatrimony.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const application = existMatrimony.applyMatrimony[index];
    if (!application) {
      return res.status(400).json({ message: "Invalid application index" });
    }

    if (application.status !== "Pending") {
      return res.status(400).json({ message: "Already processed" });
    }

    // ✅ Accept or Reject based on body
    if (accept === true) {
      application.accept = true;
      application.reject = false;
      application.status = "Accepted";
    } else {
      application.accept = false;
      application.reject = true;
      application.status = "Rejected";
    }

    await existMatrimony.save();

    res.status(200).json({
      message: `Application ${application.status} successfully`,
      success: true,
      data: existMatrimony,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
    });
  }
};

module.exports = { acceptMatrimony };
