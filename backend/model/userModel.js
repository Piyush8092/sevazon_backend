const mongoose=require('mongoose');
const validator=require('validator');

const userSchama=new mongoose.Schema({  
    name:{
        type:String,
        required:[true,'Name is required'],
      },
    email:{
        type:String,
         unique:true,
        validate:[validator.isEmail,'Email is invalid'],
        required:[true,'Email is required']
    },
    phone:{
        type:Number,
         unique:true,
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength:[6,'Password must be at least 6 characters']
    },
    role:{
        type:String,
        enum:['GENERAL','EDITOR','ADMIN'],
        default:'GENERAL'
    },
verified:{
    type:Boolean,
    default:true
},
 
subscriptions:[{
    type:mongoose.Schema.Types.ObjectId,
 }],
 
 


},{timestamps:true});

const user=mongoose.model('user',userSchama);

module.exports=user;
