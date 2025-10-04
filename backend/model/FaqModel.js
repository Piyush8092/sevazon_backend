let mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({   
    question: {
        type: String,
        required: [true, 'Question is required'],
    },  
    answer: {
        type: String,
        required: [true, 'Answer is required'],
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'User is required'],
    }
}, {timestamps: true});

const faqModel = mongoose.model('faqModel', faqSchema);

module.exports = faqModel;

