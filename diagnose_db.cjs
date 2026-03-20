const mongoose = require('mongoose');
const Order = require('./server/models/Order.cjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const total = await Order.countDocuments();
        const withCoords = await Order.countDocuments({ latitude: { $exists: true, $ne: null } });
        console.log(`Total orders: ${total}`);
        console.log(`Orders with coordinates: ${withCoords}`);
        
        if (withCoords > 0) {
            const sample = await Order.findOne({ latitude: { $exists: true, $ne: null } });
            console.log('Sample order with coords:', JSON.stringify({
                id: sample._id,
                address: sample.address,
                lat: sample.latitude,
                lng: sample.longitude
            }, null, 2));
        } else {
            console.log('NO orders found with coordinates.');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

diagnose();
