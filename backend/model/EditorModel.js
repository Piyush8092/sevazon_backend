let mongoose = require('mongoose');

let EditorSchema=new mongoose.Schema({
     
         userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:[true,'User is required'],
        },

        // Profile Information
        yourNameChannelMedia:{
            type:String,
            required:[true,'Your Name/Channel/Media is required'],
        },
        userName:{
            type:String,
            required:[true,'User Name is required'],
            unique:true
        },
        yourBio:{
            type:String,
            required:[true,'Your Bio is required'],
        },
        yourEmail:{
            type:String,
            required:[true,'Your Email is required'],
        },
        pincode:{
            type:String,
            required:[true,'Pincode is required'],
        },
        
        // Identity Verification
        uploadAadhaarCard:{
            type:String,
            required:[true,'Aadhaar Card is required'],
        },
        verifyAadhaarOrPanId:{
            type:String,
            required:[true,'Aadhaar or PAN ID verification is required'],
        },
        aboutYourself:{
            type:String,
            required:[true,'About Yourself is required'],
        },
        
        // Social Media
        socialMediaIdLink:{
            type:String,
        },
        referralUserId:{
            type:String,
        },

        title:{
            type:String,
            required:[true,'Title is required'],
        }, 
        isActive:{
            type:Boolean,
            default:true
        },
        isVerified:{
            type:Boolean,
            default:false
        },
        content:{
            type:String,
            required:[true,'Content is required'],
        },
        followers:[{
            editor_Id:{
                type:String,
            }
        }],
        following:[{
            following_Id:{
                type:String,
            }
        }],
    }
    
    ,{timestamps:true});
    
    const EditorModel = mongoose.model('EditorModel', EditorSchema);
    
    module.exports = EditorModel;
    
