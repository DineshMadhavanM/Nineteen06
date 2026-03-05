require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User.cjs');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- MongoDB User Check ---');

        const emailsToCheck = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];

        for (const email of emailsToCheck) {
            const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
            if (user) {
                console.log(`User found: ${user.email}`);
                console.log(`- ID: ${user._id}`);
                console.log(`- isAdmin: ${user.isAdmin}`);
                console.log(`- email (raw): "${user.email}"`);
            } else {
                console.log(`User NOT found: ${email}`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();
