const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order.cjs');
const User = require('../models/User.cjs');

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

// Admin emails list
const ADMIN_EMAILS = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];
const isAdminEmail = (email) => ADMIN_EMAILS.includes(email.trim().toLowerCase());

// ─── Submit Order ────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        const { items, totalAmount, address, instructions } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const newOrder = new Order({
            userId: user._id,
            items,
            totalAmount,
            address,
            instructions,
            customerName: user.username || user.email.split('@')[0],
            customerEmail: user.email,
            customerPhone: user.phone
        });

        const savedOrder = await newOrder.save();
        res.json(savedOrder);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Get My Orders ───────────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Get All Orders ───────────────────────────────────────────────────
router.get('/admin', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Confirm Order and Set Delivery Time ──────────────────────────────
router.put('/:id/confirm', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const { deliveryTime } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: 'Confirmed',
                    deliveryTime: deliveryTime
                }
            },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Complete Order (Delivery Completed) ─────────────────────────────
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    status: 'Completed'
                }
            },
            { new: true }
        );

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
