let mongoose = require('mongoose');
 
const adSchema = new mongoose.Schema({   
    title: {
        type: String,
        required: [true, 'Title is required'],
        
    },  
    description: {
        type: String,
        required: [true, 'Description is required'],
        
    },
  userId: {
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


let adModel = mongoose.model('adModel', adSchema);

module.exports = adModel;