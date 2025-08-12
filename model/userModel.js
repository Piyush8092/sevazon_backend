const mongoose=require('mongoose');
const validator=require('validator');

const userSchama=new mongoose.Schema({  
    name:{
        type:String,
        required:[true,'Name is required'],
      },
    email:{
        type:String,
        required:[true,'Email is required'],
        unique:true,
        validate:[validator.isEmail,'Email is invalid']
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[6,'Password must be at least 6 characters']
    },
    role:{
        type:String,
        enum:['GENERAL','s,AD_ADMIN,EDITOR_ADMIN,JOB_ADMIN,SUPER_ADMIN','VECHILES_ADMIN','EDUCATION_ADMIN',],
        default:'GENERAL'
    },
verified:{
    type:Boolean,
    default:true
},
followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}],
following:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}],
subscriptions:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}],
favorites:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Job'
}],
addresses:{
    type:String,
    default:''
},
job_role:{
    type:String,
    enum:['JOB_SEEKER','JOB_POSTER','service_provider',],
    default:'JOB_SEEKER'
},
service_provide:{
    type:String,
    
},
rating:{
    type:Number,
    default:0
},
rated_by:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'user'
}]

 


},{timestamps:true});

const user=mongoose.model('user',userSchama);

module.exports=user;
