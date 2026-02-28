let VehiclesModel = require("../../model/vehiclesModel");

const getVehiclesCreaterView = async (req, res) => {
  try {
    let userId = req.user._id;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    const skip = (page - 1) * limit;

    const result = await VehiclesModel.find({ userId: userId }).skip(skip).limit(limit);
    const total = await VehiclesModel.countDocuments({ userId: userId });
    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Vehicles retrieved successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
      total,
      totalPages,
      currentPage: parseInt(page),
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

module.exports = { getVehiclesCreaterView };
