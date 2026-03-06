import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get reflections for a user
router.get('/user/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const reflections = db.prepare('SELECT * FROM emotional_reflections WHERE user_id = ? ORDER BY created_at DESC').all(userId);
        res.json(reflections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save a new reflection
router.post('/save', (req, res) => {
    try {
        const { user_id, booking_id, responses, growth_analytics } = req.body;

        const stmt = db.prepare(`
            INSERT INTO emotional_reflections (user_id, booking_id, responses, growth_analytics)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(user_id, booking_id, JSON.stringify(responses), JSON.stringify(growth_analytics));
        res.json({ id: result.lastInsertRowid, message: 'Reflection saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
