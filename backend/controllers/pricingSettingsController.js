const PricingSettings = require('../model/pricingSettingsModel');

// Get current pricing settings
exports.getPricingSettings = async (req, res) => {
  try {
    const settings = await PricingSettings.findOne({ isActive: true });
    if (!settings) {
      return res.status(404).json({ message: 'Pricing settings not found' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pricing settings', error: error.message });
  }
};

// Update or create pricing settings (admin only)
exports.updatePricingSettings = async (req, res) => {
  try {
    const { type, amount, features, isActive } = req.body;
    let settings = await PricingSettings.findOne({});
    if (!settings) {
      settings = new PricingSettings({ type, amount, features, isActive });
    } else {
      settings.type = type;
      settings.amount = amount;
      settings.features = features;
      settings.isActive = isActive;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pricing settings', error: error.message });
  }
};
