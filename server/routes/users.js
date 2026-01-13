import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT user_id, name, email, role, phone, profile_picture, bio, total_kms, cities_visited FROM users WHERE user_id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure cities_visited is parsed
        user.cities_visited = JSON.parse(user.cities_visited || '[]');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
    const { name, phone, bio, profile_picture } = req.body;
    try {
        db.prepare('UPDATE users SET name = ?, phone = ?, bio = ?, profile_picture = ? WHERE user_id = ?')
            .run(name, phone, bio, profile_picture, req.user.id);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET all favorites for user
router.get('/favorites', authenticateToken, (req, res) => {
    try {
        const favorites = db.prepare(`
            SELECT f.*, 
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN f.item_id
            END as title,
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT image_url FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT image FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT image FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN (SELECT image_url FROM destinations WHERE destination_name = f.item_id)
            END as image
            FROM favorites f 
            WHERE f.user_id = ?
        `).all(req.user.id);
        res.json(favorites);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Check if item is favorited
router.get('/favorites/check/:itemType/:itemId', authenticateToken, (req, res) => {
    const { itemType, itemId } = req.params;
    try {
        const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?')
            .get(req.user.id, String(itemId), itemType);
        res.json({ isFavorite: !!existing });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add/Remove favorite
router.post('/favorites/toggle', authenticateToken, (req, res) => {
    const { itemId, itemType } = req.body;
    const stringItemId = String(itemId);
    try {
        const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?')
            .get(req.user.id, stringItemId, itemType);

        if (existing) {
            db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
            res.json({ message: 'Removed from favorites', action: 'removed' });
        } else {
            db.prepare('INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)')
                .run(req.user.id, stringItemId, itemType);
            res.json({ message: 'Added to favorites', action: 'added' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
