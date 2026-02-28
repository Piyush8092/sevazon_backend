const mongoose = require("mongoose");

const aboutUsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "About Sevazon",
    },
    content: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: "1.0.0",
    },
    contactInfo: {
      email: { type: String },
      phone: { type: String },
      website: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutUs", aboutUsSchema);
