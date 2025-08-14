let mongoose = require('mongoose');

let EditorSchema=new mongoose.Schema({
     
         userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:[true,'User is required'],
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
    