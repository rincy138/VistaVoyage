import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all taxis
router.get('/', (req, res) => {
    try {
        const taxis = db.prepare('SELECT * FROM taxis').all();
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
        const taxis = db.prepare('SELECT * FROM taxis WHERE city = ?').all(req.params.city);
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
