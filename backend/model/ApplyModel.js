const mongoose = require('mongoose');

const ApplySchama = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'jobModel',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    job_creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    job_type: {
        type: String,
        required: true
    },
 
    fullName: {
        type: String,
        required: [true, 'Full name is required']
    },
    qualification: {
        type: String
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Gender is required']
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    state: {
        type: String,
        required: [true, 'State is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required']
    },
    email: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    experience: {
        type: String
    },
    age: {
        type: String
    },
    uploadPhoto: {
        type: String
    },
    uploadResume: {
        type: String
    },
    status: {
        type: String,
        enum: ['Received', 'Accepted', 'Sent'],
        default: 'Sent'
    },
    accept_status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    location: {
        type: String
    },
    jobType:{
        type:String,
        required:true
    },
    time: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {timestamps: true});

const ApplyModel = mongoose.model("ApplyModel", ApplySchama);

module.exports = ApplyModel;
