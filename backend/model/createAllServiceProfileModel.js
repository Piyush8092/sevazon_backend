let mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    // Profile Type - determines which fields are required
    profileType: {
        type: String,
        enum: ['Service Profile', 'Business Profile'],
        required: [true, 'Profile type is required'],
    },
    
    // Basic Profile Info
    profileImage: {
        type: String,
        required: [true, 'Profile image is required'],
    },
    yourName: {
        type: String,
        // required: [true, 'Your name is required'],
    },
    businessName: {
        type: String,
        // required: function() {
        //     return this.profileType === 'Business Profile';
        // },
    },
   serviceType: {
    type: String,
    enum: ['premium', 'featured','null'],
     default: 'null'
},
isPremium: {
    type: Boolean,
    default: false,
},
isFeatured: {
    type: Boolean,
    default: false,
},
     gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: [true, 'Gender is required'],
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
    },
    district: {
        type: String,
        default: null
    },
    city: {
        type: String,
        required: [true, 'City is required'],
    },
    state: {
        type: String,
        required: [true, 'State is required'],
    },
    area: {
        type: String,
        required: [true, 'Area is required'],
    },
    houseNumberBuilding: {
        type: String,
        required: false, // Optional field
    },
    landmark: {
        type: String,
        required: false, // Optional field
    },
    
    // Category Information
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
    
    // Business/Service Details
    description: {
        type: String,
        required: function() {
            return this.profileType === 'Service Profile';
        },
    },
    businessSummary: {
        type: String,
        required: function() {
            return this.profileType === 'Business Profile';
        },
    },
    locationURL: {
        type: String,
        required: false, // Made optional - not all users may have location URL
    },
    experience: {
        type: String,
        required: false, // Optional field
    },
    establishedInYear: {
        type: String,
         
    },
    timing: {
        type: String,
        
    },
    email: {
        type: String,
         validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    
    // Contact & Communication
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
    
    // Media
    workServiceImages: {
        type: [String],
        required: function() {
            return this.profileType === 'Service Profile';
        },
        validate: {
            validator: function(v) {
                return this.profileType !== 'Service Profile' || ( v.length > 0);
            },
            message: 'Work/Service images are required for Service Profile'
        }
    },
 timeSlot: {
        type: [String],
        required: function() {
            return this.profileType === 'Service Profile';
        },
    },
    catalogImages: {
        type: [{
            image: {
                type: String,
                required: true
            },
            price: {
                type: String,
                required: true
            }
        }],
        required: function() {
            return this.profileType === 'Business Profile';
        },
        validate: {
            validator: function(v) {
                return this.profileType !== 'Business Profile' || (v && v.length > 0);
            },
            message: 'Work/Business images are required for Business Profile'
        }
    },
    
    likes:[{
        userId:{
            type:String,
        },
        like:{
            type:Boolean,
            default:true,
        }
        
    }],
    dislikes:[{
        userId:{
            type:String,
        },
        dislike:{
            type:Boolean,
            default:true,
        }
       
    }],

    comments:[{
        userId:{
            type:String,

        },
        review:{
            type:String,
        },
        ratting:{
            type:Number,
        }
    }],
      importantLink:[
     {
        link:{
            type:String,
        },
        linkName:{
            type:String,
        }
     }
    ],
    paymentDetails: {
        qrImage: {
            type: String,
            default: null
        },
        upiId: {
            type: String,
            default: null
        }
    },
    // User Reference
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    
    // Status
    isActive: {
        type: Boolean,
        default: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
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
    
    }],
   
    
}, {timestamps: true});

// Pre-save middleware to handle conditional validation
profileSchema.pre('save', function(next) {
    // Additional validation logic can be added here if needed
    next();
});

const ProfileModel = mongoose.model('ProfileModel', profileSchema);

module.exports = ProfileModel;
