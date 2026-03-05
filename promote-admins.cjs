require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User.cjs');

const ADMIN_EMAILS = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];

async function promoteAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected...');

        for (const email of ADMIN_EMAILS) {
            const result = await User.findOneAndUpdate(
                { email: { $regex: new RegExp(`^${email}$`, 'i') } },
                { $set: { isAdmin: true } },
                { new: true }
            );
            if (result) {
                console.log(`✅ Promoted: ${result.email} → isAdmin: ${result.isAdmin}`);
            } else {
                console.log(`⚠️  No user found with email: ${email}`);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('Done!');
    }
}

promoteAdmins();
