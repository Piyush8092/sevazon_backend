let MatrimonyModel = require('../../model/Matrimony');

const acceptMatrimony = async (req, res) => {
  try {
    const id = req.params.id;
    const index = parseInt(req.params.index);
    const userId = req.user._id;

    const existMatrimony = await MatrimonyModel.findById(id);
    if (!existMatrimony) {
      return res.status(400).json({ message: "Profile not found" });
    }

    // Only profile owner or admin can accept
    if (
      existMatrimony.userId.toString() !== userId.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!existMatrimony.applyMatrimony[index]) {
      return res.status(400).json({ message: "Invalid application index" });
    }

    const application = existMatrimony.applyMatrimony[index];

    if (application.accept === true) {
      return res.status(400).json({ message: "Already accepted" });
    }

    if (application.reject === true) {
      return res.status(400).json({ message: "Already rejected" });
    }

    application.accept = true;
    application.reject = false;
    application.status = "Accepted";

    await existMatrimony.save();

    res.status(200).json({
      message: "Application accepted successfully",
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


