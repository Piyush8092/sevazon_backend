const MatrimonyModel = require("../../model/Matrimony");

const updateMatrimonyInParts = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;

    // ✅ Check existence
    const existing = await MatrimonyModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        message: "Matrimony profile not found",
        success: false,
      });
    }

    // ✅ Authorization
    const userId = req.user._id;
    if (existing.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        success: false,
      });
    }

    // ✅ Direct partial update (SAFE way)
    const updated = await MatrimonyModel.findByIdAndUpdate(
      id,
      { $set: payload }, // 🔥 important
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      message: "Matrimony updated successfully",
      status: 200,
      data: updated,
      success: true,
      error: false,
    });
  } catch (e) {
    return res.status(500).json({
      message: "Something went wrong",
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateMatrimonyInParts };
