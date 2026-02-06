let mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({   
  
    title: {
        type: String,
        required: [true, 'Title is required'],
    },  
    profileId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfileModel',
        
       },
    yourNameBusinessInstituteFirmOrganisation: {
        type: String,
        required: [true, 'Your Name/business/institute/firm/organisation is required'],
    },
    offerType: {
        type: String,
         required: [true, 'Offer type is required'],
    },
    selectCategory: {
        type: String,
        required: [true, 'Select Category is required'],
    },
    selectSubCategory: {
        type: String,
        required: [true, 'Select Sub-Category is required'],
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
    locationURL: {
        type: String,
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
    offerDiscountImages: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length <= 2;
            },
            message: 'Maximum 2 images are allowed'
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    reportAndBlock:[{
        report:{
           type:String,
           required:[true,'Report is required'],
         },
      block:{
        type:Boolean,
        default:false,
    },
    reportAndBlockID: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'user',
    }

}]
}, {timestamps: true});

const offer = mongoose.model('offer', offerSchema);

module.exports = offer;
