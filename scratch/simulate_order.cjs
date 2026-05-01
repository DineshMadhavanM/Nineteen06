const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const Order = require('../server/models/Order.cjs');

async function simulateOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const newOrder = new Order({
            userId: '65f6a1e34c9a8a001c800000', // Dummy user ID
            items: [{ id: 'brownie-1', name: 'Test Brownie', quantity: 1, price: 100 }],
            totalAmount: 100,
            address: 'Verification Street, Theni',
            customerName: 'Verification Bot',
            customerEmail: 'bot@example.com',
            status: 'Pending'
        });

        const saved = await newOrder.save();
        console.log('Simulated order created:', saved._id);
        
        process.exit(0);
    } catch (err) {
        console.error('Simulation failed:', err);
        process.exit(1);
    }
}

simulateOrder();
