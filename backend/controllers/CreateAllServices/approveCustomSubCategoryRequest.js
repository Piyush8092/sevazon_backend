const createServiceModel = require("../../model/createAllServiceProfileModel");
const CustomSubCategoryRequestModel = require("../../model/CustomSubCategoryRequestModel");
const serviceListModel = require("../../model/ServiceListModel");
const { normalizeLookupKey } = require("../../utils/customSubcategoryApproval");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const approveCustomSubCategoryRequest = async (req, res) => {
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

    const category = await serviceListModel.findById(request.categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Associated category not found",
        status: 404,
        success: false,
        error: true,
      });
    }

    const approvedName = request.requestedName;
    const normalizedKey = normalizeLookupKey(approvedName);

    let approvedSubCategory = category.subService.find(
      (subCategory) => normalizeLookupKey(subCategory.name) === normalizedKey
    );

    if (!approvedSubCategory) {
      category.subService.push({
        name: approvedName,
        image: "",
      });
      await category.save();
      approvedSubCategory = category.subService.find(
        (subCategory) => normalizeLookupKey(subCategory.name) === normalizedKey
      );
    }

    const linkedProfileIds = request.linkedProfileIds || [];
    const profileQuery = linkedProfileIds.length
      ? { _id: { $in: linkedProfileIds } }
      : {
          selectCategory: request.categoryName,
          selectSubCategory: "Other",
          subCategoryOther: new RegExp(`^${escapeRegex(request.requestedName)}$`, "i"),
        };

    await createServiceModel.updateMany(profileQuery, {
      $set: {
        selectSubCategory: approvedName,
        subCategoryOther: null,
        customSubCategoryApprovalStatus: "Approved",
        customSubCategoryRequestId: request._id,
      },
    });

    request.status = "Approved";
    request.reviewNote = req.body?.reviewNote?.trim() || request.reviewNote;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.approvedSubCategoryId = approvedSubCategory?._id || null;
    await request.save();

    res.json({
      message: "Custom subcategory approved successfully",
      status: 200,
      data: {
        request,
        approvedSubCategory: approvedSubCategory || null,
      },
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

module.exports = { approveCustomSubCategoryRequest };