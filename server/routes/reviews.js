import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for an item
router.get('/:type/:id', (req, res) => {
    const { type, id } = req.params;
    try {
        const reviews = db.prepare(`
            SELECT r.*, u.name as user_name, u.profile_picture 
            FROM reviews r
            JOIN users u ON r.user_id = u.user_id
            WHERE r.item_type = ? AND r.item_id = ?
            ORDER BY r.review_date DESC
        `).all(type, String(id));
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a review
router.post('/', authenticateToken, (req, res) => {
    const { itemId, itemType, rating, review, comment, image_url } = req.body;
    const finalReview = review || comment;

    if (!itemId || !itemType || !rating || !finalReview) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        db.prepare(`
            INSERT INTO reviews (user_id, item_id, item_type, rating, review, image_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(req.user.id, String(itemId), itemType, rating, finalReview, image_url || null);

        res.status(201).json({ message: 'Review added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Edit a review
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { rating, comment, image_url } = req.body;

    try {
        const result = db.prepare(`
            UPDATE reviews 
            SET rating = ?, review = ?, image_url = ?, review_date = CURRENT_DATE
            WHERE id = ? AND user_id = ?
        `).run(rating, comment, image_url || null, id, req.user.id);

        if (result.changes === 0) return res.status(403).json({ message: 'Not authorized or review not found' });
        res.json({ message: 'Review updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a review
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare('DELETE FROM reviews WHERE id = ? AND user_id = ?').run(id, req.user.id);
        if (result.changes === 0) return res.status(403).json({ message: 'Not authorized or review not found' });
        res.json({ message: 'Review deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
