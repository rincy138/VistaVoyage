import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all taxis (Public only by default)
router.get('/', (req, res) => {
    try {
        const showExclusive = req.query.exclusive === 'true';
        let query = 'SELECT * FROM taxis';

        if (!showExclusive) {
            query += ' WHERE is_package_exclusive = 0 OR is_package_exclusive IS NULL';
        } else {
            query += ' WHERE is_package_exclusive = 1';
        }

        const taxis = db.prepare(query).all();
        const parsedTaxis = taxis.map(t => ({
            ...t,
            features: JSON.parse(t.features || '[]')
        }));
        res.json(parsedTaxis);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get taxis by city
router.get('/city/:city', (req, res) => {
    try {
        const showExclusive = req.query.exclusive === 'true';
        let query = 'SELECT * FROM taxis WHERE city = ?';

        if (!showExclusive) {
            query += ' AND (is_package_exclusive = 0 OR is_package_exclusive IS NULL)';
        } else {
            query += ' AND is_package_exclusive = 1';
        }

        const taxis = db.prepare(query).all(req.params.city);
        const parsedTaxis = taxis.map(t => ({
            ...t,
            features: JSON.parse(t.features || '[]')
        }));
        res.json(parsedTaxis);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
