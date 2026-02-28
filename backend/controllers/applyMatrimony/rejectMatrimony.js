let MatrimonyModel = require("../../model/Matrimony");

const rejectMatrimony = async (req, res) => {
  try {
    const id = req.params.id;
    const index = parseInt(req.params.index);
    const { reject } = req.body; // 👈 read from body
    const userId = req.user._id;

    console.log(`[rejectMatrimony] userId: ${userId}, profileId: ${id}, index: ${index}`);

    // ✅ Validate body
    if (typeof reject !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "reject must be true or false",
        data: null,
      });
    }

    // If reject is false → do nothing
    if (reject !== true) {
      return res.status(400).json({
        success: false,
        message: "To reject application, reject must be true",
        data: null,
      });
    }

    // Validate index
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid application index",
        data: null,
      });
    }

    const existMatrimony = await MatrimonyModel.findById(id);
    if (!existMatrimony) {
      return res.status(404).json({
        success: false,
        message: "Matrimony profile not found",
        data: null,
      });
    }

    // Verify ownership
    if (existMatrimony.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You cannot reject applications for this profile",
        data: null,
      });
    }

    const application = existMatrimony.applyMatrimony[index];

    if (!application) {
      return res.status(404).json({
        success: false,
        message: `No application found at index ${index}`,
        data: null,
      });
    }

    // Check if already processed
    if (application.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: `Application already ${application.status}`,
        data: null,
      });
    }

    // ✅ Reject logic
    application.reject = true;
    application.accept = false;
    application.status = "Rejected";

    await existMatrimony.save();

    console.log(
      `[rejectMatrimony] ✅ Application rejected: userId=${userId}, profileId=${id}, index=${index}`
    );

    return res.json({
      success: true,
      message: "Matrimony application rejected successfully",
      data: existMatrimony,
    });
  } catch (e) {
    console.error("[rejectMatrimony] ❌ Error:", e);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while rejecting the application",
      data: e.message || e,
    });
  }
};
module.exports = { rejectMatrimony };
