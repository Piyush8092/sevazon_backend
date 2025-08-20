let mongoose = require('mongoose');
 
const adSchema = new mongoose.Schema({   
    title: {
        type: String,
        required: [true, 'Title is required'],
    },  
    description: {
        type: String,
        required: [true, 'Description is required'],
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
        required: [true, 'Category is required'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    validTill: {
        type: Date,
        required: [true, 'Valid till date is required'],
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
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
