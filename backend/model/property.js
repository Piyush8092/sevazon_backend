let mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    
    // Property Type Selection
    type: {
        type: String,
        enum: ['sell', 'rent'],
        required: [true, 'Type is required'],
    },
    
  
    property: {
        type: String,
        required: [true, 'Property is required'],
    },
    propertyType: {
        type: String,
        required: [true, 'Property Type is required'],
    },
    bhk: {
        type: String,
        required: [true, 'BHK is required'],
    },
    areaSqft: {
        type: Number,
        required: [true, 'Area sqft is required'],
    },
     floorNo: {
            type: String,
        },

            totalFloor: {
            type: String,
        },
    
    facing: {
        type: String,
        required: [true, 'Facing is required'],
    },
    expectedPrice: {
        type: Number,
        required: [true, 'Expected Price is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    furnishing: {
        type: String,
        enum: ['Unfurnished', 'Semifurnished', 'Fullyfurnished'],
        required: [true, 'Furnishing is required'],
    },
    
    // Property Details - Second Screen
    possession: {
        type: String,
        required: [true, 'Possession is required'],
    },
    postedBy: {
        type: String,
        enum: ['Owner', 'Dealer', 'Builder'],
        required: [true, 'Posted By is required'],
    },
    rera: {
        type: String,
        enum: ['Rera Approved', 'Rera Registered dealer'],
    },
    fullName: {
        type: String,
        required: [true, 'Full Name is required'],
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    locationUrl: {
        type: String,
    },
    
    // Contact Preferences
    allowCallInApp: {
        type: Boolean,
        default: true,
    },
    allowCallViaPhone: {
        type: Boolean,
        default: false,
    },
    phoneNumberForCalls: {
        type: String,
    },
    allowChat: {
        type: Boolean,
        default: true,
    },
    
    // Images
    propertyImages: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length <= 6;
            },
            message: 'Maximum 6 images are allowed'
        }
    },
    
    // System fields
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const PropertyModel = mongoose.model('PropertyModel', PropertySchema);

module.exports = PropertyModel;
