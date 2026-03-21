const serviceListModel = require("../model/ServiceListModel");
const CustomSubCategoryRequestModel = require("../model/CustomSubCategoryRequestModel");

const normalizeSubcategoryName = (value = "") =>
  value.trim().replace(/\s+/g, " ");

const normalizeLookupKey = (value = "") =>
  normalizeSubcategoryName(value).toLowerCase();

const isOtherSubcategory = (value = "") =>
  typeof value === "string" && value.trim().toLowerCase() === "other";

const linkRequestToProfile = async ({
  requestId,
  profileId,
  requesterUserId,
  profileType,
}) => {
  if (!requestId) {
    return null;
  }

  const request = await CustomSubCategoryRequestModel.findById(requestId);
  if (!request) {
    return null;
  }

  if (
    requesterUserId &&
    !request.requestedByUserIds.some(
      (userId) => userId.toString() === requesterUserId.toString()
    )
  ) {
    request.requestedByUserIds.push(requesterUserId);
  }

  if (
    profileId &&
    !request.linkedProfileIds.some(
      (linkedId) => linkedId.toString() === profileId.toString()
    )
  ) {
    request.linkedProfileIds.push(profileId);
  }

  if (profileType && !request.profileTypes.includes(profileType)) {
    request.profileTypes.push(profileType);
  }

  await request.save();
  return request;
};

const resolveCustomSubcategoryRequest = async ({
  categoryName,
  requestedName,
  requesterUserId,
  profileId,
  profileType,
}) => {
  const normalizedCategoryName = normalizeSubcategoryName(categoryName);
  const normalizedRequestedName = normalizeSubcategoryName(requestedName);
  const normalizedLookupKey = normalizeLookupKey(requestedName);

  if (!normalizedCategoryName) {
    return { error: "Category is required for custom subcategory requests" };
  }

  if (!normalizedRequestedName) {
    return { error: "Custom subcategory name is required" };
  }

  const category = await serviceListModel.findOne({ name: normalizedCategoryName });

  if (!category) {
    return { error: "Selected category was not found" };
  }

  const approvedSubcategory = category.subService.find(
    (subCategory) => normalizeLookupKey(subCategory.name) === normalizedLookupKey
  );

  if (approvedSubcategory) {
    return {
      status: "approved",
      category,
      approvedName: approvedSubcategory.name,
      approvedSubCategoryId: approvedSubcategory._id,
      requestedName: normalizedRequestedName,
      request: null,
    };
  }

  let request = await CustomSubCategoryRequestModel.findOne({
    categoryId: category._id,
    normalizedRequestedName: normalizedLookupKey,
    status: "Pending",
  });

  if (!request) {
    request = await CustomSubCategoryRequestModel.create({
      categoryId: category._id,
      categoryName: category.name,
      requestedName: normalizedRequestedName,
      normalizedRequestedName: normalizedLookupKey,
      submittedByUserId: requesterUserId,
      requestedByUserIds: requesterUserId ? [requesterUserId] : [],
      linkedProfileIds: profileId ? [profileId] : [],
      profileTypes: profileType ? [profileType] : [],
    });
  } else {
    await linkRequestToProfile({
      requestId: request._id,
      profileId,
      requesterUserId,
      profileType,
    });

    request = await CustomSubCategoryRequestModel.findById(request._id);
  }

  return {
    status: "pending",
    category,
    requestedName: normalizedRequestedName,
    request,
  };
};

module.exports = {
  isOtherSubcategory,
  linkRequestToProfile,
  normalizeLookupKey,
  normalizeSubcategoryName,
  resolveCustomSubcategoryRequest,
};