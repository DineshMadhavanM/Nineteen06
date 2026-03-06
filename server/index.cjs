const path = require('path');
const express = require('express');
const envPath = path.resolve(__dirname, '../.env');
require('dotenv').config({ path: envPath });

const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.cjs');
const orderRoutes = require('./routes/orders.cjs');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI is undefined.');
    console.log('Checked path:', envPath);
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    });

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Root route for deployment verification
app.get('/', (req, res) => {
    res.send('🍰 Nineteen06 API is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
