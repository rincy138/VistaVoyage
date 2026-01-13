import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all hotels
router.get('/', (req, res) => {
    try {
        const hotels = db.prepare('SELECT * FROM hotels').all();
        // Parse amenities JSON
        const parsedHotels = hotels.map(h => ({
            ...h,
            amenities: JSON.parse(h.amenities || '[]')
        }));
        res.json(parsedHotels);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get hotels by city
router.get('/city/:city', (req, res) => {
    try {
        const hotels = db.prepare('SELECT * FROM hotels WHERE city = ?').all(req.params.city);
        const parsedHotels = hotels.map(h => ({
            ...h,
            amenities: JSON.parse(h.amenities || '[]')
        }));
        res.json(parsedHotels);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
