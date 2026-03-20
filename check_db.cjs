const mongoose = require('mongoose');
const Order = require('./server/models/Order.cjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function checkOrders() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('No MONGODB_URI found in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log(JSON.stringify(orders.map(o => ({
            id: o._id,
            customerName: o.customerName,
            address: o.address,
            latitude: o.latitude,
            longitude: o.longitude,
            createdAt: o.createdAt
        })), null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkOrders();
