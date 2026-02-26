const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // allow multiple null/missing values
        validate: {
            validator: function (v) {
                return !v || validator.isEmail(v); // validate only if provided
            },
            message: 'Email is invalid'
        },
    },
    phone: {
        type: Number,
        unique: true,
        sparse: true, // allow multiple null/missing values
      default: undefined, // prevents saving null

    },
    serviceIdOrBusinesId:{
           type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['GENERAL', 'EDITOR', 'ADMIN'],
        default: 'GENERAL'
    },
    token: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: false
    },

    primiumUser: {
        type: Boolean,
        default: false
    },


    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
    }],

    // Store active plan benefits and details
    activePlan: {
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'PricingPlan' },
        planTitle: String,
        planCategory: String,
        features: [String],
        startDate: Date,
        endDate: Date,
        amount: Number,
        status: String,
    },
    LastLoginTime: {
        type: String,
        default: null
    },

    AnyServiceCreate:{
        type:Boolean,
        default:false,
    },

    // Free post limit tracking (unified across all post types: jobs, matrimony, property, offers)
    freePostsUsed: {
        type: Number,
        default: 0,
        min: [0, 'Free posts used cannot be negative']
    },
    freePostLimit: {
        type: Number,
        default: 10, // Users get 10 free posts total across all categories
        min: [0, 'Free post limit cannot be negative']
    },

    serviceProfileBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'ProfileModel',
    }],
ServiceReportAndBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'ProfileModel',
    }],
    matrimonyProfileBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'MatrimonyModel',
    }],
    matrimonyReportAndBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'MatrimonyModel',
    }],
    jobProfileBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'jobModel',
    }],
    jobReportAndBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'jobModel',
    }],
    offerBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'offer',
    }],
    offerReportAndBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'offer',
    }],
    propertyBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'PropertyModel',
    }],
    propertyReportAndBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'PropertyModel',
    }],
    newsReportID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'NewsPost',
    }],
newsBlockID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'NewsPost',
    }],
    newsBookmarkID: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'NewsPost',
    }],
    // Blocked news authors - prevents seeing news from these authors
    blockedNewsAuthors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
    }],
    // Following/Followers for news editors
    followingEditors: [{
        editorId: {
            type: String,
        }
    }],
    editorFollowers: [{
        userId: {
            type: String,
        }
    }],
        hasMatrimonyProfile: {
            type: Boolean,
            default: false,
        },

    // FCM Tokens for push notifications (supports multiple devices)
    fcmTokens: [{
        token: {
            type: String,
            required: true
        },
        deviceId: {
            type: String,
            default: null
        },
        deviceType: {
            type: String,
            enum: ['android', 'ios', 'web'],
            default: 'android'
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        lastUsed: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Account Blocking/Ban Fields
    isBlocked: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ['active', 'blocked', 'suspended', 'deleted'],
        default: 'active'
    },
    blockedReason: {
        type: String,
        default: null
    },
    blockedAt: {
        type: Date,
        default: null
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    profileImage: {
        type: String,
        default: null
    },
    pincode: {
        type: String,
        default: null
    },
    district: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
}, { timestamps: true });

/**
 * Custom validation: require at least email or phone
 */
userSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Either email or phone is required');
        this.invalidate('phone', 'Either email or phone is required');
    }
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
