const mongoose = require("mongoose");

const featuredCategoryTypeSchema = new mongoose.Schema(
  {
    // Type identifier (seasonal, wedding, education, etc.)
    typeKey: {
      type: String,
      required: true,
      unique: true,
      enum: ["seasonal", "wedding", "education"],
      index: true,
    },

    // Display label for this category type (editable by admin)
    label: {
      type: String,
      required: true,
    },

    // Description for this category type (editable by admin)
    description: {
      type: String,
      default: "",
    },

    // Whether this category type is active/enabled
    isActive: {
      type: Boolean,
      default: true,
    },

    // Display order for tabs
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const FeaturedCategoryTypeModel = mongoose.model(
  "featuredCategoryType",
  featuredCategoryTypeSchema
);

module.exports = FeaturedCategoryTypeModel;
