const mongoose = require("mongoose");

const privacyPolicySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: String,
      required: true,
    },
    sections: [
      {
        number: { type: String, required: true }, // e.g. "1", "1.1", "2.3"
        title: { type: String, default: Date.now },
        content: { type: String }, // for paragraphs
        items: [{ type: String }], // for bullet points
      },
    ],
    commitment: { type: String }, // optional (e.g. security note)
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrivacyPolicy", privacyPolicySchema);
