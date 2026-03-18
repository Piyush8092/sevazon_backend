const mongoose = require("mongoose");

const customSubCategoryRequestSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "serviceListModel",
      required: [true, "Category is required"],
    },
    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    requestedName: {
      type: String,
      required: [true, "Requested subcategory name is required"],
      trim: true,
    },
    normalizedRequestedName: {
      type: String,
      required: [true, "Normalized subcategory name is required"],
      trim: true,
      lowercase: true,
      index: true,
    },
    submittedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Submitting user is required"],
    },
    requestedByUserIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      default: [],
    },
    linkedProfileIds: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "createServiceModel",
        },
      ],
      default: [],
    },
    profileTypes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewNote: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    approvedSubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

customSubCategoryRequestSchema.index(
  { categoryId: 1, normalizedRequestedName: 1, status: 1 },
  { name: "custom_subcategory_request_lookup" }
);

module.exports = mongoose.model(
  "customSubCategoryRequest",
  customSubCategoryRequestSchema
);