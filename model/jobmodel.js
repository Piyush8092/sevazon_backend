let mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
   
    title: {
        type: String,
        required: [true, 'Title is required'],
    },
    yourNameBusinessInstituteFirmCompany: {
        type: String,
        required: [true, 'Name/Business/Institute/Firm/Company is required'],
    },
    selectCategory: {
        type: String,
        required: [true, 'Category is required'],
    },
    selectSubCategory: {
        type: String,
        required: [true, 'Sub-category is required'],
    },
    subCategoryOther: {
        type: String,
        required: function() {
            return this.selectSubCategory === 'Other';
        },
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
    },
    salaryFrom: {
        type: Number,
        required: [true, 'Salary from is required'],
    },
    salaryTo: {
        type: Number,
        required: [true, 'Salary to is required'],
    },
    salaryPer: {
        type: String,
        enum: ['Per Month', 'Per Year', 'Per Day', 'Per Hour'],
        default: 'Per Month',
        required: [true, 'Salary period is required'],
    },
    locationURL: {
        type: String,
    },
    requiredExperience: {
        type: String,
        required: [true, 'Required experience is required'],
    },
    workShift: {
        type: [String],
        enum: ['Day Shift', 'Night Shift'],
        required: [true, 'Work shift is required'],
    },
    workMode: {
        type: [String],
        enum: ['On-site', 'Remote', 'Hybrid'],
        required: [true, 'Work mode is required'],
    },
    workType: {
        type: [String],
        enum: ['Full-time', 'Part-time', 'Intern'],
        required: [true, 'Work type is required'],
    },
    allowCallInApp: {
        type: Boolean,
        default: false,
        required: [true, 'Allow call in app preference is required'],
    },
    allowCallViaPhone: {
        type: Boolean,
        default: false,
        required: [true, 'Allow call via phone preference is required'],
    },
    phoneNumberForCalls: {
        type: String,
        required: function() {
            return this.allowCallViaPhone === true;
        },
    },
    allowChat: {
        type: Boolean,
        default: false,
        required: [true, 'Allow chat preference is required'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

const jobModel = mongoose.model('jobModel', jobSchema);

module.exports = jobModel;
