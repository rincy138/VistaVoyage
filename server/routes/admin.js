import express from 'express';
import { db } from '../database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure only Admin access
router.use(authenticateToken, authorizeRole(['Admin']));

// Get all users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, email, role, created_at FROM users').all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Promote user to Agent (or change role)
router.put('/users/:id/role', (req, res) => {
    const { role } = req.body;
    if (!['Traveler', 'Agent', 'Admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
        if (result.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bookings (System Report mock)
router.get('/bookings', (req, res) => {
    try {
        const bookings = db.prepare(`
      SELECT b.id, u.name as user_name, p.title as package_title, b.booking_date, b.status 
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN packages p ON b.package_id = p.id
      ORDER BY b.booking_date DESC
    `).all();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
