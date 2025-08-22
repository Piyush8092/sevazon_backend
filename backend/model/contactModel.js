const mongoose=require('mongoose');

const contactSchama=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
        email:{
        type:String,
        required:true
    },    subject:{
        type:String,
        required:true
    },    message:{
        type:String,
        required:true
    },
})

  const ContactModel=mongoose.model("ContactModel",contactSchama);

  module.exports=ContactModel