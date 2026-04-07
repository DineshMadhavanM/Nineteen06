const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env
const envPath = path.resolve(__dirname, './.env');
require('dotenv').config({ path: envPath });

async function verifyReviews() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const reviews = await mongoose.connection.db.collection('reviews').find({}).toArray();
        console.log('Total Reviews in DB:', reviews.length);
        if (reviews.length > 0) {
            console.log('Latest Review:', JSON.stringify(reviews[reviews.length - 1], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verifyReviews();
