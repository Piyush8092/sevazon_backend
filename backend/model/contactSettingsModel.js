const mongoose = require('mongoose');

/**
 * Contact Settings Schema
 * Stores admin-configured contact options for the Contact Us page
 * This is a singleton model - only one document should exist
 */
const contactSettingsSchema = new mongoose.Schema({
    // Phone contact settings
    phoneEnabled: {
        type: Boolean,
        default: false,
        required: true
    },
    phoneNumber: {
        type: String,
        default: '',
        validate: {
            validator: function(v) {
                // Allow empty string when phone is disabled
                if (!this.phoneEnabled) return true;
                // Validate phone number format when enabled (10-15 digits, optional + prefix)
                return /^\+?[1-9]\d{9,14}$/.test(v);
            },
            message: 'Invalid phone number format. Use international format (e.g., +919876543210)'
        }
    },

    // WhatsApp contact settings
    whatsappEnabled: {
        type: Boolean,
        default: false,
        required: true
    },
    whatsappNumber: {
        type: String,
        default: '',
        validate: {
            validator: function(v) {
                // Allow empty string when WhatsApp is disabled
                if (!this.whatsappEnabled) return true;
                // Validate WhatsApp number format when enabled (10-15 digits, optional + prefix)
                return /^\+?[1-9]\d{9,14}$/.test(v);
            },
            message: 'Invalid WhatsApp number format. Use international format (e.g., +919876543210)'
        }
    },

    // Metadata
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to ensure phone/WhatsApp numbers are provided when enabled
contactSettingsSchema.pre('save', function(next) {
    if (this.phoneEnabled && !this.phoneNumber) {
        return next(new Error('Phone number is required when phone contact is enabled'));
    }
    if (this.whatsappEnabled && !this.whatsappNumber) {
        return next(new Error('WhatsApp number is required when WhatsApp contact is enabled'));
    }
    next();
});

// Static method to get or create settings (singleton pattern)
contactSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        // Create default settings if none exist
        settings = await this.create({
            phoneEnabled: false,
            phoneNumber: '',
            whatsappEnabled: false,
            whatsappNumber: ''
        });
    }
    return settings;
};

// Static method to update settings
contactSettingsSchema.statics.updateSettings = async function(updates, userId) {
    let settings = await this.getSettings();
    
    // Update fields
    if (updates.phoneEnabled !== undefined) settings.phoneEnabled = updates.phoneEnabled;
    if (updates.phoneNumber !== undefined) settings.phoneNumber = updates.phoneNumber;
    if (updates.whatsappEnabled !== undefined) settings.whatsappEnabled = updates.whatsappEnabled;
    if (updates.whatsappNumber !== undefined) settings.whatsappNumber = updates.whatsappNumber;
    if (userId) settings.lastUpdatedBy = userId;
    
    await settings.save();
    return settings;
};

const ContactSettingsModel = mongoose.model('ContactSettings', contactSettingsSchema);

module.exports = ContactSettingsModel;

