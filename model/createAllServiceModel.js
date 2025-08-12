let mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
     
    },
    type: {
        type: String,
        required: [true, 'Type is required'],
        
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
         
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        
    },
    experience: {
        type: String,
        required: [true, 'Experience is required'],
        
    },
    skills: {
        type: [String],
        required: [true, 'Skills are required'],
        
    },
    company: {
        type: String,
        required: [true, 'Company is required'],
        
    },
    category: {
        type: String,
        required: [true, 'Type is required'],
        
    },
    job_poster_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
        
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    featured: {
        type: Boolean,
        default: true 
    },
    company_GSTIN: {
        type: String,
         
    },
    work_type:{
        type:'String',
enum:['Full Time','Part Time','Freelance','Internship'],
        required:[true,'Work type is required']
    },

    work_mode:{
        type:'String',
        enum:['Remote','Onsite','Hybrid'],
        required:[true,'Work mode is required']
    },
         varified:{
            type:Boolean,
            default:false
        },
        post_data:{
            type:Date,
            default:Date.now()
        }
    
},{timestamps:true});

const createServiceModel = mongoose.model('createServiceModel', jobSchema);

module.exports = createServiceModel;