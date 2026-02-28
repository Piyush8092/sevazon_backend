const mongoose = require("mongoose");

const pricingSettingsSchema = new mongoose.Schema({
  type: { type: String, enum: ["FREE", "PAID"], required: true },
  amount: { type: Number, default: 0 },
  features: {
    matrimonyAccess: { type: Boolean, default: true },
    chatAccess: { type: Boolean, default: true },
    callAccess: { type: Boolean, default: true },
    connectRequestAccess: { type: Boolean, default: true },
  },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model("PricingSettings", pricingSettingsSchema);
