const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

// Only these two email addresses can access the Admin Panel
const ADMIN_EMAILS = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];
const isAdminEmail = (email) => ADMIN_EMAILS.includes(email.trim().toLowerCase());

// ─── Register ───────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { email, password, username, phone, city } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            email,
            password: hashedPassword,
            username,
            phone,
            city,
            isAdmin: isAdminEmail(email)
        });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secrettoken', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                city: user.city,
                isAdmin: isAdminEmail(user.email),
                loyaltyCakes: user.loyaltyCakes
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Login ───────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User does not exist' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Keep DB in sync
        if (user.isAdmin !== isAdminEmail(user.email)) {
            await User.findByIdAndUpdate(user._id, { isAdmin: isAdminEmail(user.email) });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secrettoken', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                phone: user.phone,
                city: user.city,
                isAdmin: isAdminEmail(user.email),
                loyaltyCakes: user.loyaltyCakes
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Auth Middleware ──────────────────────────────────────────────────────────
const auth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secrettoken');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            city: user.city,
            isAdmin: isAdminEmail(user.email),
            loyaltyCakes: user.loyaltyCakes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', auth, async (req, res) => {
    try {
        const { username, phone, city } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { username, phone, city } },
            { new: true }
        ).select('-password');
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            phone: user.phone,
            city: user.city,
            isAdmin: isAdminEmail(user.email),
            loyaltyCakes: user.loyaltyCakes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Get All Users ─────────────────────────────────────────────────────
router.get('/admin/users', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const isAdmin = currentUser ? isAdminEmail(currentUser.email) : false;
        console.log(`Admin check for ${currentUser?.email}: ${isAdmin}`);

        if (!currentUser || !isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Toggle User Loyalty Cake ─────────────────────────────────────────
console.log('Registering PUT /admin/users/:id/loyalty');
router.put('/admin/users/:id/loyalty', auth, async (req, res) => {
    console.log(`loyalty request received for user ${req.params.id}`);
    try {
        const currentUser = await User.findById(req.user.id);
        const isAdmin = currentUser ? isAdminEmail(currentUser.email) : false;
        if (!currentUser || !isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { cakeIndex } = req.body;
        if (cakeIndex === undefined || cakeIndex < 0 || cakeIndex > 8) {
            return res.status(400).json({ message: 'Invalid cake index' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Toggle the cake state
        const updatedLoyalty = [...user.loyaltyCakes];
        updatedLoyalty[cakeIndex] = !updatedLoyalty[cakeIndex];

        user.loyaltyCakes = updatedLoyalty;
        await user.save();

        res.json({ loyaltyCakes: user.loyaltyCakes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
