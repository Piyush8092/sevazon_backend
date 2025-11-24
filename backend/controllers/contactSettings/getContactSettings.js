const ContactSettingsModel = require('../../model/contactSettingsModel');

/**
 * Get Contact Settings
 * GET /api/get-contact-settings
 * Public endpoint - no authentication required
 * Returns the current contact settings for the Contact Us page
 */
const getContactSettings = async (req, res) => {
    try {
        // Get settings (creates default if none exist)
        const settings = await ContactSettingsModel.getSettings();

        // Return only the necessary fields (exclude internal metadata)
        const response = {
            phoneEnabled: settings.phoneEnabled,
            phoneNumber: settings.phoneEnabled ? settings.phoneNumber : null,
            whatsappEnabled: settings.whatsappEnabled,
            whatsappNumber: settings.whatsappEnabled ? settings.whatsappNumber : null,
        };

        res.json({
            message: 'Contact settings retrieved successfully',
            status: 200,
            data: response,
            success: true,
            error: false
        });
    } catch (e) {
        console.error('Error fetching contact settings:', e);
        res.status(500).json({
            message: 'Failed to retrieve contact settings',
            status: 500,
            data: e.message,
            success: false,
            error: true
        });
    }
};

module.exports = { getContactSettings };

