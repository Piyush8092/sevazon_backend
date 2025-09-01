const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    email: {
        type: String,
        unique: true,
        sparse: true, // allow multiple null/missing values
        validate: {
            validator: function (v) {
                return !v || validator.isEmail(v); // validate only if provided
            },
            message: 'Email is invalid'
        },
    },
    phone: {
        type: Number,
        unique: true,
        sparse: true, // allow multiple null/missing values
      default: undefined, // prevents saving null

    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['GENERAL', 'EDITOR', 'ADMIN'],
        default: 'GENERAL'
    },
    token: {
        type: String,
    },
    verified: {
        type: Boolean,
        default: true
    },
    subscriptions: [{
        type: mongoose.Schema.Types.ObjectId,
    }]
}, { timestamps: true });

/**
 * Custom validation: require at least email or phone
 */
userSchema.pre('validate', function (next) {
    if (!this.email && !this.phone) {
        this.invalidate('email', 'Either email or phone is required');
        this.invalidate('phone', 'Either email or phone is required');
    }
    next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;
