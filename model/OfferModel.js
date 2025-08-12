let mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({   
    banner_image: {
        type: String,
        required: [true, 'Banner image is required'],
        
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        
    },  
    description: {
        type: String,
        required: [true, 'Description is required'],
        
    },
    banner_poster_id: {
        type: mongoose.Schema.Types.ObjectId,
 required: true,
    },
    varified: {
        type: Boolean,
        default: false 
    },
   catagory:{
    type:String,
    
   },
   active:{
    type:Boolean,
    default:true
   },
vaild_till:{
    type:Date,
    
},
location:{
    type:String,
    
}


},{timestamps:true});

const offer = mongoose.model('offer', offerSchema);

module.exports = offer;