const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlistByUserId, removeFromWishlist } = require('../models/wishlist');
const authMiddleware = require('../middleware/auth');

// Add to Wishlist
router.post('/', authMiddleware, async (req, res) => {
    const { productId } = req.body;
    const userId = req.user.UserID; // Assuming req.user contains the authenticated user's details

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const result = await addToWishlist(userId, productId);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        res.status(400).json({ message: err.message });
    }
});

// Remove from Wishlist
router.delete('/:id', authMiddleware, async (req, res) => {
    const productId = req.params.id; // Assuming the product ID is passed as a route parameter
    const userId = req.user.UserID; // Assuming req.user contains the authenticated user's details

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const result = await removeFromWishlist(userId, productId);
        res.status(200).json(result);
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

// Get User Wishlist
router.get('/', authMiddleware, async (req, res) => {
    const userId = req.user.UserID; // Assuming req.user contains the authenticated user's details

    try {
        const wishlist = await getWishlistByUserId(userId);
        res.status(200).json(wishlist);
    } catch (err) {
        console.error('Error fetching wishlist:', err);
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = router;