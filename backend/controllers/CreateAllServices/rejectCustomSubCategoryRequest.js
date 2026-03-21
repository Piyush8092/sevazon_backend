const createServiceModel = require("../../model/createAllServiceProfileModel");
const CustomSubCategoryRequestModel = require("../../model/CustomSubCategoryRequestModel");

const rejectCustomSubCategoryRequest = async (req, res) => {
  try {
    if (req.user?.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized access",
        status: 403,
        success: false,
        error: true,
      });
    }

    const requestId = req.params.id;
    const request = await CustomSubCategoryRequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Custom subcategory request not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    request.status = "Rejected";
    request.reviewNote = req.body?.reviewNote?.trim() || request.reviewNote;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    if (request.linkedProfileIds?.length) {
      await createServiceModel.updateMany(
        { _id: { $in: request.linkedProfileIds } },
        {
          $set: {
            customSubCategoryApprovalStatus: "Rejected",
            customSubCategoryRequestId: request._id,
          },
        }
      );
    }

    res.json({
      message: "Custom subcategory request rejected successfully",
      status: 200,
      data: request,
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

module.exports = { rejectCustomSubCategoryRequest };