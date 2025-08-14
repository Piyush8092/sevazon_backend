const mongoose=require('mongoose');

const ApplySchama=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    jobId:{
        type:mongoose.Schema.Types.ObjectId,
         required:true
    },
    userId:{
type:mongoose.Schema.Types.ObjectId,
         required:true
    },
    job_creatorId:{
        type:mongoose.Schema.Types.ObjectId,
         required:true
    },
    job_type:{
        type:String,
      required:true

    },
    status:{
        type:String,
        enum:['Received','Accepted','Sent'],
        default:'Sent'
    },
    accept_status:{
        type:String,
        enum:['Pending','Accepted','Rejected'],
        default:'Pending'
    },
           city:{
        type:String,
     },  
       location:{
        type:String,
     },
     time:{
        type:String,
        required:true,
        default:Date.now()
     }
})

  const ApplyModel=mongoose.model("ApplyModel",ApplySchama);

  module.exports=ApplyModel