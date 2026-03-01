let MatrimonyModel = require("../../model/Matrimony");

const getSpecificApplyMatrimony = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`[getSpecificApplyMatrimony] profileId: ${id}`);
    const result = await MatrimonyModel.find({ _id: id })
      .populate("userId", "name email phone postFeatures")
      .populate("applyMatrimony.applyUserId", "name email phone");
    return res.json({
      success: true,
      message: "All applications retrieved successfully",
      data: result,
    });
  } catch (e) {
    console.error("[getSpecificApplyMatrimony] Error:", e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: e.message || e,
    });
  }
};

module.exports = { getSpecificApplyMatrimony };
