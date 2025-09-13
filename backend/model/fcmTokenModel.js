const mongoose = require('mongoose');

const fcmTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User ID is required'],
        index: true
    },
    token: {
        type: String,
        required: [true, 'FCM token is required'],
        unique: true,
        index: true
    },
    deviceInfo: {
        deviceId: {
            type: String,
            required: [true, 'Device ID is required']
        },
        deviceType: {
            type: String,
            enum: ['android', 'ios', 'web'],
            required: [true, 'Device type is required']
        },
        deviceModel: {
            type: String
        },
        osVersion: {
            type: String
        },
        appVersion: {
            type: String
        }
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    },
    // Track token refresh/update history
    tokenHistory: [{
        oldToken: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Notification delivery statistics
    deliveryStats: {
        totalSent: {
            type: Number,
            default: 0
        },
        totalDelivered: {
            type: Number,
            default: 0
        },
        totalFailed: {
            type: Number,
            default: 0
        },
        lastDeliveryAttempt: Date,
        lastSuccessfulDelivery: Date
    }
}, { 
    timestamps: true,
    // Add compound indexes for efficient queries
    indexes: [
        { userId: 1, isActive: 1 },
        { token: 1, isActive: 1 },
        { 'deviceInfo.deviceId': 1, userId: 1 }
    ]
});

// Pre-save middleware to update lastUsed timestamp
fcmTokenSchema.pre('save', function(next) {
    if (this.isModified('token') || this.isNew) {
        this.lastUsed = new Date();
    }
    next();
});

// Instance method to mark token as inactive
fcmTokenSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

// Instance method to update delivery stats
fcmTokenSchema.methods.updateDeliveryStats = function(success) {
    this.deliveryStats.totalSent += 1;
    this.deliveryStats.lastDeliveryAttempt = new Date();
    
    if (success) {
        this.deliveryStats.totalDelivered += 1;
        this.deliveryStats.lastSuccessfulDelivery = new Date();
    } else {
        this.deliveryStats.totalFailed += 1;
    }
    
    return this.save();
};

// Static method to find active tokens for a user
fcmTokenSchema.statics.findActiveTokensForUser = function(userId) {
    return this.find({ 
        userId: userId, 
        isActive: true 
    }).sort({ lastUsed: -1 });
};

// Static method to cleanup old inactive tokens
fcmTokenSchema.statics.cleanupOldTokens = function(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return this.deleteMany({
        isActive: false,
        updatedAt: { $lt: cutoffDate }
    });
};

// Static method to find tokens with poor delivery rates
fcmTokenSchema.statics.findPoorPerformingTokens = function(failureThreshold = 0.8) {
    return this.aggregate([
        {
            $match: {
                isActive: true,
                'deliveryStats.totalSent': { $gte: 10 }
            }
        },
        {
            $addFields: {
                failureRate: {
                    $divide: ['$deliveryStats.totalFailed', '$deliveryStats.totalSent']
                }
            }
        },
        {
            $match: {
                failureRate: { $gte: failureThreshold }
            }
        }
    ]);
};

const FCMToken = mongoose.model('FCMToken', fcmTokenSchema);

module.exports = FCMToken;
