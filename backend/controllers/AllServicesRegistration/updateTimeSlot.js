let createServiceModel = require("../../model/createAllServiceProfileModel");

const updateTimeSlot = async (req, res) => {
  try {
    let id = req.params.id;
    let userId = req.user._id;
    let payload = req.body;

    let ExistUser = await createServiceModel.findById(id);

    if (!ExistUser) {
      return res.status(404).json({ message: "Service not found" });
    }
    if (ExistUser.userId.toString() !== userId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    if (!payload.timeSlot) {
      return res.status(400).json({ message: "Time slot is required" });
    }
    ExistUser.timeSlot.push(payload.timeSlot);
    const result = await ExistUser.save();

    res.json({
      message: "Time slot updated successfully",
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

module.exports = { updateTimeSlot };
