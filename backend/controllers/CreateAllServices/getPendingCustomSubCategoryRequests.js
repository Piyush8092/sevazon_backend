const CustomSubCategoryRequestModel = require("../../model/CustomSubCategoryRequestModel");

const getPendingCustomSubCategoryRequests = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        status: 403,
        success: false,
        error: true,
      });
    }

    const requests = await CustomSubCategoryRequestModel.find({ status: "Pending" })
      .sort({ createdAt: -1 })
      .populate("submittedByUserId", "name email phone")
      .populate(
        "linkedProfileIds",
        "profileType yourName businessName selectCategory selectSubCategory subCategoryOther"
      );

    res.json({
      message: "Pending custom subcategory requests retrieved successfully",
      status: 200,
      data: requests,
      success: true,
      error: false,
    });
  } catch (e) {
    res.status(500).json({
      message: "Something went wrong",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { getPendingCustomSubCategoryRequests };