const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    // User information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required']
    },
    
    // Plan information
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PricingPlan',
        required: [true, 'Plan is required']
    },
    planTitle: {
        type: String,
        required: [true, 'Plan title is required']
    },
    planCategory: {
        type: String,
        required: [true, 'Plan category is required']
    },
    
    // Payment details
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR'
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required']
    },
    
    // Razorpay order details
    razorpayOrderId: {
        type: String,
        required: [true, 'Razorpay order ID is required']
    },
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    
    // Payment status
    status: {
        type: String,
        enum: ['created', 'pending', 'success', 'failed', 'refunded'],
        default: 'created'
    },
    
    // Plan validity
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    
    // Additional metadata
    paymentMethod: {
        type: String,
        default: null
    },
    errorCode: {
        type: String,
        default: null
    },
    errorDescription: {
        type: String,
        default: null
    },
    
    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Update the updatedAt timestamp before updating
paymentSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

