const ContactSettingsModel = require("../../model/contactSettingsModel");

/**
 * Update Contact Settings
 * PUT /api/update-contact-settings
 * Admin-only endpoint - requires authentication and ADMIN role
 * Updates the contact settings for the Contact Us page
 */
const updateContactSettings = async (req, res) => {
  try {
    // Check if user is authenticated and is an admin
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Unauthorized. Admin access required.",
        status: 403,
        success: false,
        error: true,
      });
    }

    const { phoneEnabled, phoneNumber, whatsappEnabled, whatsappNumber } = req.body;

    // Validate that at least one field is being updated
    if (
      phoneEnabled === undefined &&
      phoneNumber === undefined &&
      whatsappEnabled === undefined &&
      whatsappNumber === undefined
    ) {
      return res.status(400).json({
        message: "No fields to update",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Validate phone number if phone is being enabled
    if (phoneEnabled === true && !phoneNumber) {
      return res.status(400).json({
        message: "Phone number is required when enabling phone contact",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Validate WhatsApp number if WhatsApp is being enabled
    if (whatsappEnabled === true && !whatsappNumber) {
      return res.status(400).json({
        message: "WhatsApp number is required when enabling WhatsApp contact",
        status: 400,
        success: false,
        error: true,
      });
    }

    // Prepare updates object
    const updates = {};
    if (phoneEnabled !== undefined) updates.phoneEnabled = phoneEnabled;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (whatsappEnabled !== undefined) updates.whatsappEnabled = whatsappEnabled;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;

    // Update settings
    const updatedSettings = await ContactSettingsModel.updateSettings(updates, req.user._id);

    // Return updated settings
    const response = {
      phoneEnabled: updatedSettings.phoneEnabled,
      phoneNumber: updatedSettings.phoneEnabled ? updatedSettings.phoneNumber : null,
      whatsappEnabled: updatedSettings.whatsappEnabled,
      whatsappNumber: updatedSettings.whatsappEnabled ? updatedSettings.whatsappNumber : null,
      updatedAt: updatedSettings.updatedAt,
    };

    res.json({
      message: "Contact settings updated successfully",
      status: 200,
      data: response,
      success: true,
      error: false,
    });
  } catch (e) {
    console.error("Error updating contact settings:", e);
    res.status(500).json({
      message: e.message || "Failed to update contact settings",
      status: 500,
      data: e.message,
      success: false,
      error: true,
    });
  }
};

module.exports = { updateContactSettings };
