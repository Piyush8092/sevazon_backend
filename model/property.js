let mongoose=require('mongoose');

const PropertySchema = new mongoose.Schema({   
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,'User is required'],
    },
type:{
    type:String,
    enum:['buy','rent'],
    required:[true,'Type is required'],
},

    title:{
        type:String,
        required:[true,'Title is required']
    },salary:{
        type:Number,
        required:[true,'Salary is required'],
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
}

,{timestamps:true});

const PropertyModel = mongoose.model('PropertyModel', PropertySchema);

module.exports = PropertyModel;
