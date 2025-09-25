let mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({   
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    },
    serviceRequire:{
        type:String,
        required:[true,'Service is required'],
    },
}
)

const leadModel = mongoose.model('leadModel', leadSchema);

module.exports = leadModel;
