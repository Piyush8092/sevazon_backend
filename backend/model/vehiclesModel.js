let mongoose = require('mongoose');

const vehiclesSchema = new mongoose.Schema({   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },

   

    // Basic Details
    status: {
        type: String,
        enum: ['sell', 'rent'],
        default: 'sell',
        required: [true, 'Status is required'],
    },
    
    vehicleType: {
        type: String,
        required: [true, 'Vehicle Type is required'],
    },
    
    brand: {
        type: String,
        required: [true, 'Brand is required'],
    },
    
    model: {
        type: String,
        required: [true, 'Model is required'],
    },
    
    year: {
        type: String,
        required: [true, 'Year is required'],
    },
    
    fuelType: {
        type: String,
        enum: ['Petrol', 'Diesel', 'CNG', 'Hybrid', 'Electric', 'LPG'],
        required: [true, 'Fuel Type is required'],
    },
    
    transmissionType: {
        type: String,
        enum: ['Manual', 'Automatic'],
        required: [true, 'Transmission Type is required'],
    },
    
    ownership: {
        type: String,
        required: [true, 'Ownership is required'],
    },
    
    kmDriven: {
        type: String,
        required: [true, 'KM Driven is required'],
    },
    
    expectedPrice: {
        type: Number,
        required: [true, 'Expected Price is required'],
    },
    
    description: {
        type: String,
        required: [true, 'Description is required'],
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
        required: function() {
            return this.allowCallViaPhone === true;
        },
    },
    
    allowChat: {
        type: Boolean,
        default: true,
    },
    
    // Vehicle Images
    vehicleImages: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length >= 1 && v.length <= 6;
            },
            message: 'Minimum 1 and maximum 6 vehicle images are required'
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

const VehiclesModel = mongoose.model('VehiclesModel', vehiclesSchema);

module.exports = VehiclesModel;
