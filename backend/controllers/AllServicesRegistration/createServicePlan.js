const mongoose = require("mongoose");
const ProfileModel = require("../../model/createAllServiceProfileModel");

const createServicePlan = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { serviceType, isSuccess } = req.body;
    const userId = req.user._id;

    if (isSuccess === false) {
      return res.status(400).json({
        success: false,
        message: "Payment failed. Service plan not updated.",
      });
    }
    // ✅ Validate serviceId
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    // ✅ Validate serviceType
    const allowedPlans = ["premium", "featured", "null"];

    if (!serviceType || !allowedPlans.includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid service plan. Allowed: premium, featured, null",
      });
    }

    // ✅ Find profile
    const profile = await ProfileModel.findById(serviceId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // 🔐 Check ownership
    if (profile.userId.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    // ✅ Update serviceType
    profile.serviceType = serviceType;
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Service plan updated successfully",
      data: {
        profileId: profile._id,
        serviceType: profile.serviceType,
      },
    });
  } catch (error) {
    console.error("Update Service Plan Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createServicePlan };
