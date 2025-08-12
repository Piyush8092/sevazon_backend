let mongoose=require('mongoose');

const MatrimonySchema = new mongoose.Schema({   
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:[true,'User is required'],
    },
    title:{
        type:String,
        required:[true,'Title is required'],
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

const MatrimonyModel = mongoose.model('MatrimonyModel', MatrimonySchema);

module.exports = MatrimonyModel;
