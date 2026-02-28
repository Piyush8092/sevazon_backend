let mongoose = require("mongoose");

const localServiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },

    // Basic Details
    title: {
      type: String,
      required: [true, "Title is required"],
    },

    yourNameBusinessInstituteFirmOrganisation: {
      type: String,
      required: [true, "Your Name/business/institute/firm/organisation is required"],
    },

    selectCategory: {
      type: String,
      required: [true, "Select Category is required"],
    },

    selectSubCategory: {
      type: String,
      required: [true, "Select Sub-Category is required"],
    },

    subCategoryOther: {
      type: String,
      required: function () {
        return this.selectSubCategory === "Other";
      },
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    locationURL: {
      type: String,
    },

    // Contact Preferences
    allowCallInApp: {
      type: Boolean,
      default: true,
    },

    allowCallViaPhone: {
      type: Boolean,
      default: false,
    },

    phoneNumberForCalls: {
      type: String,
      required: function () {
        return this.allowCallViaPhone === true;
      },
    },

    allowChat: {
      type: Boolean,
      default: true,
    },

    // System fields
    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const LocalServiceModel = mongoose.model("LocalServiceModel", localServiceSchema);

module.exports = LocalServiceModel;
