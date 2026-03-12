const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    username: String,
    phone: String,
    city: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    loyaltyCakes: {
        type: [Boolean],
        default: [false, false, false, false, false, false, false, false, false]
    },
    fcmTokens: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
