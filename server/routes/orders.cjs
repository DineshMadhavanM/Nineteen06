const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order.cjs');
const User = require('../models/User.cjs');
const Settings = require('../models/Settings.cjs');

router.use((req, res, next) => {
    console.log(`Orders Router: ${req.method} ${req.url}`);
    next();
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

// Admin emails list
const ADMIN_EMAILS = ['kit27.ad17@gmail.com', 'nineteen06.in@gmail.com'];
const isAdminEmail = (email) => ADMIN_EMAILS.includes(email.trim().toLowerCase());

// ─── Submit Order ────────────────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
    try {
        console.log('--- NEW ORDER SUBMISSION ---');
        console.log('Body:', JSON.stringify(req.body, null, 2));

        // ─── Shop Availability Check ──────────────────────────────────────────
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({ manualStatus: 'OPEN' });
        }

        const now = new Date();
        const currentHour = now.getHours();
        
        const isWithinTimeWindow = currentHour >= 9 && currentHour < 15;
        const isManuallyOpen = settings.manualStatus === 'OPEN';

        if (!isManuallyOpen || !isWithinTimeWindow) {
            let reason = !isManuallyOpen ? 'The shop is manually closed by the owner.' : 'Ordering is only available between 9:00 AM and 3:00 PM.';
            return res.status(403).json({ 
                message: 'Ordering is currently unavailable.',
                reason: reason,
                status: 'CLOSED'
            });
        }

        const { items, totalAmount, address, instructions, latitude, longitude } = req.body;
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
            customerPhone: user.phone,
            latitude,
            longitude
        });

        const savedOrder = await newOrder.save();

        // Send Push Notification to Admins
        if (req.firebaseAdmin) {
            try {
                const admins = await User.find({ email: { $in: ADMIN_EMAILS } });
                const adminTokens = admins.flatMap(admin => admin.fcmTokens).filter(Boolean);

                if (adminTokens.length > 0) {
                    console.log(`FCM: Sending new order notification to ${adminTokens.length} admin tokens.`);
                    const message = {
                        notification: {
                            title: '🌟 New Order Received!',
                            body: `${user.username || 'A customer'} placed an order for ₹${totalAmount}.`,
                        },
                        tokens: [...new Set(adminTokens)],
                    };
                    const response = await req.firebaseAdmin.messaging().sendEachForMulticast(message);
                    console.log(`FCM: Push notification successful. Success count: ${response.successCount}, Failure count: ${response.failureCount}`);
                    if (response.failureCount > 0) {
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) console.error(`FCM: Token at index ${idx} failed:`, resp.error);
                        });
                    }
                } else {
                    console.warn('FCM: No admin tokens found to notify.');
                }
            } catch (notifyErr) {
                console.error('FCM: Failed to send admin push notification:', notifyErr);
            }
        }

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

        // Send Push Notification to Customer
        if (req.firebaseAdmin) {
            try {
                const customer = await User.findById(order.userId);
                if (customer && customer.fcmTokens && customer.fcmTokens.length > 0) {
                    console.log(`FCM: Sending confirmation notification to user ${customer.email} (${customer.fcmTokens.length} tokens).`);
                    const message = {
                        notification: {
                            title: '✅ Order Confirmed!',
                            body: `your order is confirm your food is preparing`,
                        },
                        tokens: [...new Set(customer.fcmTokens)]
                    };
                    const response = await req.firebaseAdmin.messaging().sendEachForMulticast(message);
                    console.log(`FCM: Sent confirmation to customer. Success: ${response.successCount}, Failure: ${response.failureCount}`);
                    if (response.failureCount > 0) {
                        response.responses.forEach((resp, idx) => {
                            if (!resp.success) console.error(`FCM: Customer token at index ${idx} failed:`, resp.error);
                        });
                    }
                } else {
                    console.warn(`FCM: No tokens found for user ${customer?.email}`);
                }
            } catch (notifyErr) {
                console.error('FCM: Failed to send customer push notification:', notifyErr);
            }
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Admin: Reject Order ──────────────────────────────
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status: 'Rejected' } }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.firebaseAdmin) {
            try {
                const customer = await User.findById(order.userId);
                if (customer && customer.fcmTokens && customer.fcmTokens.length > 0) {
                    console.log(`FCM: Sending rejection notification to user ${customer.email}.`);
                    const message = {
                        notification: {
                            title: '❌ Order Rejected',
                            body: `We really sorry for our inconvenience situations food order is rejected if you order next time you got the coupen code 15% offer`,
                        },
                        tokens: [...new Set(customer.fcmTokens)]
                    };
                    const response = await req.firebaseAdmin.messaging().sendEachForMulticast(message);
                    console.log(`FCM: Rejection sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
                } else {
                    console.warn(`FCM: No tokens found for user ${customer?.email}`);
                }
            } catch (notifyErr) { console.error('FCM: Failed to send push notification:', notifyErr); }
        }
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Admin: Set Order Ready ──────────────────────────────
router.put('/:id/ready', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status: 'Ready' } }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.firebaseAdmin) {
            try {
                const customer = await User.findById(order.userId);
                if (customer && customer.fcmTokens && customer.fcmTokens.length > 0) {
                    console.log(`FCM: Sending Ready notification to user ${customer.email}.`);
                    const message = {
                        notification: {
                            title: '🚚 Food Ready!',
                            body: `your food ready we deliver soon`,
                        },
                        tokens: [...new Set(customer.fcmTokens)]
                    };
                    const response = await req.firebaseAdmin.messaging().sendEachForMulticast(message);
                    console.log(`FCM: Ready notification sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
                } else {
                    console.warn(`FCM: No tokens found for user ${customer?.email}`);
                }
            } catch (notifyErr) { console.error('FCM: Failed to send push notification:', notifyErr); }
        }
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Admin: Set Order Reached ──────────────────────────────
router.put('/:id/reached', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const order = await Order.findByIdAndUpdate(req.params.id, { $set: { status: 'Reached' } }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (req.firebaseAdmin) {
            try {
                const customer = await User.findById(order.userId);
                if (customer && customer.fcmTokens && customer.fcmTokens.length > 0) {
                    const message = {
                        notification: {
                            title: '📍 Arrived!',
                            body: `we reach your location come to take food`,
                        },
                        tokens: [...new Set(customer.fcmTokens)]
                    };
                    await req.firebaseAdmin.messaging().sendEachForMulticast(message);
                }
            } catch (notifyErr) { console.error('Failed to send push notification:', notifyErr); }
        }
        res.json(order);
    } catch (err) { res.status(500).json({ error: err.message }); }
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

// ─── Admin: Delete Order ─────────────────────────────────────────────────────
console.log('Registering DELETE /api/orders/:id');
router.delete('/:id', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser || !isAdminEmail(currentUser.email)) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
