let createServiceModel = require("../../model/createAllServiceProfileModel");
let userModel = require("../../model/userModel");
const AdminSpecificServiceView = async (req, res) => {
  try {
    let id = req.params.id;
    let ExistUser = await userModel.findById(id);
    if (!ExistUser) {
      return res.status(404).json({ message: "Service not found" });
    }
    // console.log(ExistUser);
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    let result = await createServiceModel.find({ userId: id });
    if (!result) {
      res.json({ message: "No data found", status: 400, data: {}, success: false, error: true });
    }
    res.json({
      message: "Service detail retrieved successfully",
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

module.exports = { AdminSpecificServiceView };
