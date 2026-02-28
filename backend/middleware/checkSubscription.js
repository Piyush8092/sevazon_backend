const PricingSettings = require("../model/pricingSettingsModel");
const User = require("../model/userModel");

// Middleware to protect paid features
module.exports = async function checkSubscription(req, res, next) {
  try {
    const settings = await PricingSettings.findOne({ isActive: true });
    if (!settings || settings.type === "FREE") {
      return next(); // Free mode, allow access
    }
    // PAID mode: user must be authenticated and subscribed
    const user = req.user;
    if (!user || user.subscriptionStatus !== "ACTIVE") {
      return res.status(403).json({
        message: "Subscription required to access this feature",
        success: false,
        error: true,
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      message: "Error checking subscription",
      error: error.message,
      success: false,
      error: true,
    });
  }
};
