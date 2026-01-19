import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all hotels (Public only by default)
router.get('/', (req, res) => {
    try {
        // By default, only show hotels that are NOT exclusive to packages
        const showExclusive = req.query.exclusive === 'true';
        let query = 'SELECT * FROM hotels';

        if (!showExclusive) {
            query += ' WHERE is_package_exclusive = 0 OR is_package_exclusive IS NULL';
        } else {
            // If requesting exclusive, valid to filter for them specifically if needed, 
            // but for now let's say 'exclusive=true' means "Get Package Exclusive Hotels"
            query += ' WHERE is_package_exclusive = 1';
        }

        const hotels = db.prepare(query).all();
        const parsedHotels = hotels.map(h => ({
            ...h,
            amenities: JSON.parse(h.amenities || '[]')
        }));
        res.json(parsedHotels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get hotels by city
router.get('/city/:city', (req, res) => {
    try {
        const showExclusive = req.query.exclusive === 'true';
        let query = 'SELECT * FROM hotels WHERE city = ?';

        if (!showExclusive) {
            query += ' AND (is_package_exclusive = 0 OR is_package_exclusive IS NULL)';
        } else {
            query += ' AND is_package_exclusive = 1';
        }

        const hotels = db.prepare(query).all(req.params.city);
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
