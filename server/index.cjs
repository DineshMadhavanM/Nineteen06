const path = require('path');
const express = require('express');
const fs = require('fs');

// Try to load .env locally, but don't fail if it doesn't exist (e.g., on Render)
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    require('dotenv').config(); // Fallback to default check
}

const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Firebase Admin
const admin = require('firebase-admin');
const serviceAccountPath = path.resolve(__dirname, './firebase-service-account.json');
if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized successfully in index.cjs.');
    }
} else {
    console.warn('WARNING: firebase-service-account.json not found. Push notifications will be disabled.');
}

const authRoutes = require('./routes/auth.cjs');
const orderRoutes = require('./routes/orders.cjs');

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI is undefined.');
    console.log('----------------------------------------------------');
    console.log('IF YOU ARE DEPLOYING ON RENDER:');
    console.log('1. Go to your Render Dashboard');
    console.log('2. Select this Web Service -> Environment');
    console.log('3. Add Environment Variable: Key="MONGODB_URI" Value="your_mongodb_connection_string"');
    console.log('4. Click "Save Changes" and Render will redeploy.');
    console.log('----------------------------------------------------');
    process.exit(1);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Health check endpoint for Render
app.get('/health', (req, res) => res.status(200).send('OK'));

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
        // Do not exit process on MongoDB connection failure,
        // allow server to continue running for health checks.
    });

app.use((req, res, next) => {
    req.firebaseAdmin = admin;
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ─── Frontend Serving (Production) ──────────────────────────────────────────
// Serve static files from the Vite build directory
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve the React app's index.html
app.get('/{*path}', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send('Backend API is running. Frontend build not found.');
    }
});