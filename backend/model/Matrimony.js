let mongoose = require('mongoose');

const MatrimonySchema = new mongoose.Schema({   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    
    // Basic Details
    profileCreatedFor: {
        type: String,
        enum: ['Self', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Relative'],
        required: [true, 'Profile created for is required'],
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: [true, 'Gender is required'],
    },
    motherTongue: {
        type: String,
        required: [true, 'Mother tongue is required'],
    },
    maritalStatus: {
        type: String,
        enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'],
        required: [true, 'Marital status is required'],
    },
    height: {
        type: String,
        required: [true, 'Height is required'],
    },
    
    // Religious Information
    religion: {
        type: String,
        required: [true, 'Religion is required'],
    },
    caste: {
        type: String,
        required: [true, 'Caste is required'],
    },
    subCaste: {
        type: String,
    },
    noCasteBarrier: {
        type: Boolean,
        default: false,
    },
    rashiAstroDetails: {
        type: String,
    },
    
    // Professional Information
    profession: {
        type: String,
        required: [true, 'Profession is required'],
    },
    highestQualification: {
        type: String,
        required: [true, 'Highest qualification is required'],
    },
    employmentType: {
        type: String,
        enum: ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'],
        required: [true, 'Employment type is required'],
    },
    annualIncome: {
        type: String,
        enum: ['Below 1 Lakh', '1-2 Lakhs', '2-3 Lakhs', '3-5 Lakhs', '5-7 Lakhs', '7-10 Lakhs', '10-15 Lakhs', '15-20 Lakhs', '20+ Lakhs'],
    },
    
    // Location & Other Details
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
    },
    city: {
        type: String,
        required: [true, 'City is required'],
    },
    state: {
        type: String,
        required: [true, 'State is required'],
    },
    moreAboutYourself: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
    },
    images: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: 'Minimum 2 images are required'
        }
    },
    
    // Partner Requirements
    partnerAge: {
        min: {
            type: Number,
            // required: [true, 'Partner minimum age is required'],
        },
        max: {
            type: Number,
            // required: [true, 'Partner maximum age is required'],
        }
    },
    partnerHeight: {
        min: {
            type: String,
            // required: [true, 'Partner minimum height is required'],
        },
        max: {
            type: String,
            // required: [true, 'Partner maximum height is required'],
        }
    },
    partnerMaritalStatus: {
        type: [String],
     enum: ['Never Married', 'Divorced', 'Widowed', 'Separated'],
        // required: [true, 'Partner marital status is required'],
    },
    partnerCity: {
        type: String,
        // required: [true, 'Partner city is required'],
    },
    partnerState: {
        type: String,
        // required: [true, 'Partner state is required'],
    },
    partnerEmploymentType: {
        type: String,
         enum: ['Private Job', 'Government Job', 'Business', 'Self Employed', 'Student', 'Not Working'],
        // required: [true, 'Partner employment type is required'],
    },
    partnerReligion: {
        type: String,
        // required: [true, 'Partner religion is required'],
    },
    partnerRashiAstroDetails: {
        type: String,
    },
    partnerMotherTongue: {
        type: String,
        // required: [true, 'Partner mother tongue is required'],
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

const MatrimonyModel = mongoose.model('MatrimonyModel', MatrimonySchema);

module.exports = MatrimonyModel;
