let MatrimonyModel = require('../../model/Matrimony');

const applyMatrimony = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user._id;

    const existMatrimony = await MatrimonyModel.findById(id);
    if (!existMatrimony) {
      return res.status(400).json({ message: "Profile not found" });
    }

    // Cannot apply to own profile
    if (existMatrimony.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own profile" });
    }

    // ✅ Check inside this profile only
    const alreadyApplied = existMatrimony.applyMatrimony.find(
      (item) => item.applyUserId.toString() === userId.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: "You already applied to this profile" });
    }

    existMatrimony.applyMatrimony.push({
      applyUserId: userId,
      applyMatrimonyStatus: true,
      status: "Pending",
    });

    await existMatrimony.save();

    res.status(200).json({
      message: "Application submitted successfully",
      success: true,
      data: existMatrimony,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      error: true,
      success: false,
    });
  }
};
module.exports = { applyMatrimony };
