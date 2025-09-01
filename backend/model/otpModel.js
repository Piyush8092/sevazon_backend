let mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({   
    phone: {
        type: String,
        required: [true, 'Email is required'],
    },
    otp: {
        type: String,
        required: [true, 'OTP is required'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes
    }
}, {timestamps: true});

const otpModel = mongoose.model('otpModel', otpSchema);

module.exports = otpModel;
