require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.cjs');

const app = express();
app.use(express.json());
app.use(cors());

// Simple logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected via Environment Variable'))
    .catch(err => console.log('MongoDB Connection Error:', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
