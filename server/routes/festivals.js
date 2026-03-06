import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all festivals
router.get('/', (req, res) => {
    try {
        const festivals = db.prepare('SELECT * FROM festivals ORDER BY start_date ASC').all();
        res.json(festivals);
    } catch (err) {
        console.error("Error fetching festivals:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get upcoming festivals
router.get('/upcoming', (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const festivals = db.prepare('SELECT * FROM festivals WHERE end_date >= ? ORDER BY start_date ASC LIMIT 5').all(today);
        res.json(festivals);
    } catch (err) {
        console.error("Error fetching upcoming festivals:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
