const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String },
    steps: [String],
    items: [String],
  },
  { _id: false }
);

const deletionPolicySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    sections: [sectionSchema], // array of objects, not nested object
    commitment: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountDeletion", deletionPolicySchema);
