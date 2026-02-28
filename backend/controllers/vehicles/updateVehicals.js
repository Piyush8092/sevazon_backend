let VehiclesModel = require("../../model/vehiclesModel");

const updateVehicle = async (req, res) => {
  try {
    let id = req.params.id;
    let payload = req.body;

    let ExistVehicle = await VehiclesModel.findById(id);
    if (!ExistVehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    let UserId = req.user._id;
    if (ExistVehicle.userId.toString() !== UserId.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // Validate vehicle images if being updated
    if (
      payload.vehicleImages &&
      (!Array.isArray(payload.vehicleImages) ||
        payload.vehicleImages.length < 1 ||
        payload.vehicleImages.length > 6)
    ) {
      return res
        .status(400)
        .json({ message: "Minimum 1 and maximum 6 vehicle images are required" });
    }

    // Validate phone number when call via phone is enabled
    const allowCallViaPhone =
      payload.allowCallViaPhone !== undefined
        ? payload.allowCallViaPhone
        : ExistVehicle.allowCallViaPhone;
    if (allowCallViaPhone === true) {
      const phoneNumber = payload.phoneNumberForCalls || ExistVehicle.phoneNumberForCalls;
      if (!phoneNumber) {
        return res
          .status(400)
          .json({ message: "Phone number is required when call via phone is enabled" });
      }
    }

    // Validate expected price if being updated
    if (payload.expectedPrice !== undefined && payload.expectedPrice <= 0) {
      return res.status(400).json({ message: "Expected price must be greater than 0" });
    }

    // Validate enum values if being updated
    if (payload.status) {
      const validStatus = ["sell", "rent"];
      if (!validStatus.includes(payload.status)) {
        return res.status(400).json({ message: "Invalid status. Must be sell or rent" });
      }
    }

    if (payload.fuelType) {
      const validFuelTypes = ["Petrol", "Diesel", "CNG", "Hybrid", "Electric", "LPG"];
      if (!validFuelTypes.includes(payload.fuelType)) {
        return res.status(400).json({ message: "Invalid fuel type" });
      }
    }

    if (payload.transmissionType) {
      const validTransmissionTypes = ["Manual", "Automatic"];
      if (!validTransmissionTypes.includes(payload.transmissionType)) {
        return res.status(400).json({ message: "Invalid transmission type" });
      }
    }

    // Validate pincode format if being updated
    if (payload.pincode) {
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(payload.pincode)) {
        return res.status(400).json({ message: "Invalid pincode format" });
      }
    }

    const result = await VehiclesModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Vehicle updated successfully",
      status: 200,
      data: result,
      success: true,
      error: false,
    });
  } catch (e) {
    // Handle validation errors
    if (e.name === "ValidationError") {
      const errors = Object.values(e.errors).map((err) => err.message);
      return res.status(400).json({
        message: "Validation failed",
        status: 400,
        data: errors,
        success: false,
        error: true,
      });
    }

    res.json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateVehicle };
