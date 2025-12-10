let mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    title: {
        type: String,
        // required: [true, 'Title is required'],
    },
    description: {
        type: String,
        // required: [true, 'Description is required'],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        // required: [true, 'Category is required'],
    },
    // Ad plan type - which pricing plan the user selected
    adPlanType: {
        type: String,
        enum: ['banner', 'full-page', 'video-banner', 'full-page-video'],
        default: 'banner',
        required: [true, 'Ad plan type is required'],
    },
    // User-controlled placement pages - where the ad should be displayed
    placementPages: {
        type: [String],
        enum: ['home', 'news', 'service', 'property', 'job', 'matrimony', 'vehicle', 'offer', 'editor'],
        default: ['home']
    },
    // Legacy fields - kept for backward compatibility but no longer used for placement control
    route:{
        type: String,
        //give all get route of backend as enum
        // enum: ['service','job','/property','/get-all-news','/get-all-local-services','/get-all-vehicle','/get-all-matrimony','/get-all-editor','/get-all-offer',],
        // required: [true, 'Route is required'],
    },
    position: {
        type:  Number,
        // required: [true, 'Position is required'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    validTill: {
        type: Date,
        // required: [true, 'Valid till date is required'],
    },
    location: {
        type: String,
        // required: [true, 'Location is required'],
    },
    pincode: {
        type: String,
        // Location-based filtering - pincode where the ad should be displayed
    },
    adImages: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length >= 1 && v.length <= 5;
            },
            message: 'Minimum 1 and maximum 5 ad images are required'
        }
    },
    rejectionReason: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, {timestamps: true});

let adModel = mongoose.model('adModel', adSchema);

module.exports = adModel;
