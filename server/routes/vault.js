import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Get all vault items for a user
router.get('/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const items = db.prepare('SELECT * FROM vault_items WHERE user_id = ? ORDER BY created_at DESC').all(userId);

        // Add a "isLocked" property based on unlock_date
        const processedItems = items.map(item => ({
            ...item,
            isLocked: new Date(item.unlock_date) > new Date()
        }));

        res.json(processedItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new vault item
router.post('/add', (req, res) => {
    try {
        const { user_id, type, title, content, file_path, unlock_date } = req.body;

        const stmt = db.prepare(`
            INSERT INTO vault_items (user_id, type, title, content, file_path, unlock_date)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(user_id, type, title, content, file_path, unlock_date);
        res.json({ id: result.lastInsertRowid, message: 'Item added to vault' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a vault item
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const result = db.prepare(`
            UPDATE vault_items 
            SET title = ?, content = ? 
            WHERE id = ?
        `).run(title, content, id);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
