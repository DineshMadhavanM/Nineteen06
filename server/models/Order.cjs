const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    instructions: String,
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Reached', 'Completed', 'Cancelled', 'Rejected'],
        default: 'Pending'
    },
    deliveryTime: String,
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    latitude: Number,
    longitude: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
