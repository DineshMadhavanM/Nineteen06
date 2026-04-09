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
const localServiceAccountPath = path.resolve(__dirname, './firebase-service-account.json');
const renderSecretPath = '/etc/secrets/firebase-service-account.json';

let serviceAccountPathToUse = null;
if (fs.existsSync(localServiceAccountPath)) {
    serviceAccountPathToUse = localServiceAccountPath;
} else if (fs.existsSync(renderSecretPath)) {
    serviceAccountPathToUse = renderSecretPath;
}

if (serviceAccountPathToUse) {
    const serviceAccount = require(serviceAccountPathToUse);
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log(`Firebase Admin initialized successfully from ${serviceAccountPathToUse}.`);
    }
} else {
    console.warn('WARNING: firebase-service-account.json not found locally or in Render secrets (/etc/secrets). Push notifications will be disabled.');
}

const authRoutes = require('./routes/auth.cjs');
const orderRoutes = require('./routes/orders.cjs');
const reviewRoutes = require('./routes/reviews.cjs');
const settingsRoutes = require('./routes/settings.cjs');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    console.error('CRITICAL ERROR: MONGODB_URI is undefined.');
    process.exit(1);
}

// ─── Logger ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} (original: ${req.originalUrl})`);
    req.firebaseAdmin = admin;
    next();
});

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.status(200).send('OK'));

// ─── Database ──────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected successfully!'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err.message);
    });

// ─── API Routes ───────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => {
    res.json({ pong: true, time: new Date().toISOString() });
});

app.get('/api/debug', (req, res) => {
    res.json({ message: 'API is working', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Nominatim Geocoding Proxy (avoids CORS in browser) ─────────────────────
app.get('/api/geocode/reverse', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon required' });
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Nineteen06BakeryApp/1.0' }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Geocoding failed' });
    }
});

app.get('/api/geocode/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'q required' });
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=in`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Nineteen06BakeryApp/1.0' }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
});

app.get('/api/geocode/route', async (req, res) => {
    const { startLat, startLon, endLat, endLon } = req.query;
    if (!startLat || !startLon || !endLat || !endLon) return res.status(400).json({ error: 'start and end coordinates required' });
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Nineteen06BakeryApp/1.0' }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Routing failed' });
    }
});

// ─── Frontend Serving (Production) ──────────────────────────────────────────
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all: for any request not handled by API, serve the React app's index.html
app.use((req, res) => {
    // If it's an API request that wasn't handled, return 404
    console.log(`Catch-all hit for ${req.url}. startsWith(/api): ${req.url.startsWith('/api')}`);
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send('Backend API is running. Frontend build not found.');
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));