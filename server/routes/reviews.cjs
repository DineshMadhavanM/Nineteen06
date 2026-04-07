const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Review = require('../models/Review.cjs');
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

router.get('/', async (req, res) => {
    console.log('--- GET /api/reviews request received ---');
    try {
        // Calculate global stats from ALL reviews
        const allRatings = await Review.find({}, 'rating').sort({ rating: 1 });
        const totalReviews = allRatings.length;
        console.log(`Found ${totalReviews} total ratings.`);
        
        let averageRating = 5.0;
        let medianRating = 5.0;
        
        if (totalReviews > 0) {
            // Mean
            const sum = allRatings.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = sum / totalReviews;
            
            // Median
            const mid = Math.floor(totalReviews / 2);
            if (totalReviews % 2 !== 0) {
                medianRating = allRatings[mid].rating;
            } else {
                medianRating = (allRatings[mid - 1].rating + allRatings[mid].rating) / 2;
            }
        }

        // Fetch latest reviews for display (Admins see these)
        const reviews = await Review.find().sort({ date: -1 }).limit(50); // Increased limit for Admins

        res.json({
            averageRating,
            medianRating,
            totalReviews,
            reviews
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    console.log('--- POST /api/reviews request received ---');
    console.log('User ID:', req.user.id);
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
        }
        if (!comment || comment.trim() === '') {
            return res.status(400).json({ message: 'Please provide a comment' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const nameToSave = user.username || user.email.split('@')[0];

        // Upsert: One review per user. This ensures "updating" works as expected.
        const updatedReview = await Review.findOneAndUpdate(
            { userId: user._id },
            { 
                name: nameToSave,
                rating: Number(rating),
                comment,
                date: new Date()
            },
            { upsert: true, new: true }
        );

        console.log('Review stored/updated successfully:', updatedReview._id);
        res.status(201).json(updatedReview);
    } catch (err) {
        console.error('Error storing review:', err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
