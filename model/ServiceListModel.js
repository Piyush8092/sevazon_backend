let mongoose = require('mongoose');

const serviceListSchema = new mongoose.Schema({   
    name:{
        type:String,
        required:[true,'Name is required'],
    },
    image:{
        type:String,
        required:[true,'Image is required'],
    },
    subService:{
        type:[{
            name:{
                type:String,
                required:[true,'Name is required'],
            },
            image:{
                type:String,
                required:[true,'Image is required'],
            }
        }],
     } ,


},{timestamps:true});


let serviceListModel = mongoose.model('serviceListModel', serviceListSchema);

module.exports = serviceListModel;
