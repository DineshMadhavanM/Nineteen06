const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.cjs');
const orderRoutes = require('./routes/orders.cjs');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected via Environment Variable'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Root route for deployment verification
app.get('/', (req, res) => {
    res.send('🍰 Nineteen06 API is running...');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
