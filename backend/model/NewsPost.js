let mongoose = require('mongoose');

let NewsSchame=new mongoose.Schema({
     
         userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user',
            required:[true,'User is required'],
        },
        title:{
            type:String,
            required:[true,'Title is required'],
        }, 
        description:{
            type:String,
            required:[true,'Description is required'],
        },
        hashtag:{
            type:String,
            required:[true,'Hashtag is required'],
        },
        mentions:{
            type:String,
        },
        newsImages:{
            type:[String],
            validate:{
                validator: function(v) {
                    return v && v.length >= 1 && v.length <= 5;
                },
                message: 'Minimum 1 and maximum 5 news images are required'
            }
        },
        newsVideo:{
            type:String,
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
        likes:[{
            userId:{
                type:String,
            }
        }],
        dislikes:[{
            userId:{
                type:String,
            }
        }],
        comments:[{
            userId:{
                type:String,
            },
            comment:{
                type:String,
            }
        }],
        shares:{
            type:Number,
            default:0
        },
        location:{
            type:String,
            required:[true,'Location/State is required'],
        }
    }

    ,{timestamps:true});
    
    const NewsPostModel = mongoose.model('NewsPostModel', NewsSchame);
    
    module.exports = NewsPostModel;
