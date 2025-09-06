const mongoose = require("mongoose");

const termsAndConditionsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: "TERMS AND CONDITIONS",
    },
    lastUpdated: {
      type: String,
     default: Date.now,
    },
    sections: [
      {
        number: { type: String, required: true }, // e.g. "1", "3.2"
        title: { type: String, required: true },
        content: { type: String }, // for paragraphs
        items: [{ type: String }], // for bullet points
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TermsAndConditions", termsAndConditionsSchema);
