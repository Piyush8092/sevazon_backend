const mongoose = require('mongoose');

const notificationPreferencesSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required'],
        unique: true,
        index: true
    },
    // Global notification settings
    globalSettings: {
        enableNotifications: {
            type: Boolean,
            default: true
        },
        enableSound: {
            type: Boolean,
            default: true
        },
        enableVibration: {
            type: Boolean,
            default: true
        },
        quietHours: {
            enabled: {
                type: Boolean,
                default: false
            },
            startTime: {
                type: String, // Format: "22:00"
                default: "22:00"
            },
            endTime: {
                type: String, // Format: "08:00"
                default: "08:00"
            }
        }
    },
    image:{
        type: String,
        default: null
    },
    // Category-specific preferences
    categories: {
        // Chat and messaging
        chat: {
            enabled: {
                type: Boolean,
                default: true
            },
            newMessage: {
                type: Boolean,
                default: true
            },
            groupMessage: {
                type: Boolean,
                default: true
            }
        },
        // Voice and video calls
        calls: {
            enabled: {
                type: Boolean,
                default: true
            },
            incomingCall: {
                type: Boolean,
                default: true
            },
            missedCall: {
                type: Boolean,
                default: true
            }
        },
        // Service-related notifications
        services: {
            enabled: {
                type: Boolean,
                default: true
            },
            newOffer: {
                type: Boolean,
                default: true
            },
            offerUpdate: {
                type: Boolean,
                default: true
            },
            serviceRequest: {
                type: Boolean,
                default: true
            }
        },
        // Booking and appointments
        bookings: {
            enabled: {
                type: Boolean,
                default: true
            },
            confirmation: {
                type: Boolean,
                default: true
            },
            reminder: {
                type: Boolean,
                default: true
            },
            cancellation: {
                type: Boolean,
                default: true
            },
            statusUpdate: {
                type: Boolean,
                default: true
            }
        },
        // Payment notifications
        payments: {
            enabled: {
                type: Boolean,
                default: true
            },
            paymentReceived: {
                type: Boolean,
                default: true
            },
            paymentFailed: {
                type: Boolean,
                default: true
            },
            refund: {
                type: Boolean,
                default: true
            }
        },
        // Job-related notifications
        jobs: {
            enabled: {
                type: Boolean,
                default: true
            },
            newJobPosted: {
                type: Boolean,
                default: true
            },
            applicationReceived: {
                type: Boolean,
                default: true
            },
            applicationStatusUpdate: {
                type: Boolean,
                default: true
            }
        },
        // Property notifications
        property: {
            enabled: {
                type: Boolean,
                default: true
            },
            newProperty: {
                type: Boolean,
                default: true
            },
            priceUpdate: {
                type: Boolean,
                default: true
            },
            inquiry: {
                type: Boolean,
                default: true
            }
        },
        // News and updates
        news: {
            enabled: {
                type: Boolean,
                default: true
            },
            breakingNews: {
                type: Boolean,
                default: true
            },
            newsUpdate: {
                type: Boolean,
                default: false
            }
        },
        // System notifications
        system: {
            enabled: {
                type: Boolean,
                default: true
            },
            maintenance: {
                type: Boolean,
                default: true
            },
            securityAlert: {
                type: Boolean,
                default: true
            },
            announcement: {
                type: Boolean,
                default: true
            }
        }
    },
    // Muted conversations (for chat notifications)
    mutedConversations: [{
        conversationId: {
            type: String,
            required: true
        },
        isMuted: {
            type: Boolean,
            default: true
        },
        mutedAt: {
            type: Date,
            default: Date.now
        },
        mutedUntil: {
            type: Date, // Optional: for temporary muting
            default: null
        }
    }]
}, {
    timestamps: true
});

// Instance method to check if a conversation is muted
notificationPreferencesSchema.methods.isConversationMuted = function(conversationId) {
    if (!this.mutedConversations || this.mutedConversations.length === 0) {
        return false;
    }

    const mutedConv = this.mutedConversations.find(
        conv => conv.conversationId === conversationId && conv.isMuted
    );

    if (!mutedConv) {
        return false;
    }

    // Check if temporary mute has expired
    if (mutedConv.mutedUntil) {
        const now = new Date();
        if (now > mutedConv.mutedUntil) {
            return false; // Mute period has expired
        }
    }

    return true;
};

// Instance method to check if notification should be sent
notificationPreferencesSchema.methods.shouldSendNotification = function(category, type) {
    // Check global settings first
    if (!this.globalSettings.enableNotifications) {
        return false;
    }

    // Check if we're in quiet hours
    if (this.globalSettings.quietHours.enabled) {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' +
                           now.getMinutes().toString().padStart(2, '0');

        const startTime = this.globalSettings.quietHours.startTime;
        const endTime = this.globalSettings.quietHours.endTime;

        // Handle quiet hours that span midnight
        if (startTime > endTime) {
            if (currentTime >= startTime || currentTime <= endTime) {
                return false;
            }
        } else {
            if (currentTime >= startTime && currentTime <= endTime) {
                return false;
            }
        }
    }

    // Check category-specific settings
    const categorySettings = this.categories[category];
    if (!categorySettings || !categorySettings.enabled) {
        return false;
    }

    // Check type-specific settings
    if (type && categorySettings[type] !== undefined) {
        return categorySettings[type];
    }

    return true;
};

// Static method to get default preferences for a new user
notificationPreferencesSchema.statics.getDefaultPreferences = function(userId) {
    return new this({ userId });
};

// Static method to find or create preferences for a user
notificationPreferencesSchema.statics.findOrCreateForUser = async function(userId) {
    // Validate userId before querying
    if (!userId || userId === 'unknown' || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid userId provided to findOrCreateForUser: ${userId}`);
        throw new Error(`Invalid userId: ${userId}`);
    }

    let preferences = await this.findOne({ userId });

    if (!preferences) {
        preferences = this.getDefaultPreferences(userId);
        await preferences.save();
    }

    return preferences;
};

const NotificationPreferences = mongoose.model('NotificationPreferences', notificationPreferencesSchema);

module.exports = NotificationPreferences;
