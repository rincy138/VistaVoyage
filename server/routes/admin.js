import express from 'express';
import { db } from '../database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure only Admin access
router.use(authenticateToken, authorizeRole(['Admin']));

// Get all users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare('SELECT user_id as id, name, email, role, status, created_at FROM users').all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM users WHERE user_id = ?').run(req.params.id);
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
        const result = db.prepare('UPDATE users SET role = ? WHERE user_id = ?').run(role, req.params.id);
        if (result.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Statistics Overview
router.get('/stats', (req, res) => {
    console.log('Admin Stats Request User:', req.user);
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalAgents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'Agent'").get().count;
        const totalDestinations = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
        const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
        const totalRevenue = db.prepare("SELECT SUM(total_amount) as sum FROM bookings WHERE status = 'Confirmed'").get().sum || 0;

        res.json({
            totalUsers,
            totalAgents,
            totalDestinations,
            totalBookings,
            totalRevenue
        });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Pending Agents (Mocked since table missing)
router.get('/agents/pending', (req, res) => {
    try {
        // Table travel_agents doesn't exist in current schema, return empty
        res.json([]);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve/Reject Agent
router.put('/agents/:id/approve', (req, res) => {
    res.json({ message: `Agent status updated` });
});

// DESTINATIONS CRUD
router.get('/destinations', (req, res) => {
    try {
        const destinations = db.prepare('SELECT * FROM destinations').all();
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/destinations', (req, res) => {
    const { destination_name, location, description, image_url } = req.body;

    if (!destination_name || !location) {
        return res.status(400).json({ message: 'Destination name and location are required' });
    }

    try {
        const result = db.prepare(`
            INSERT INTO destinations (destination_name, location, description, image_url)
            VALUES (?, ?, ?, ?)
        `).run(destination_name, location, description, image_url);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Destination created' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/destinations/:id', (req, res) => {
    const { destination_name, location, description, image_url } = req.body;
    try {
        db.prepare(`
            UPDATE destinations 
            SET destination_name = ?, location = ?, description = ?, image_url = ?
            WHERE destination_id = ?
        `).run(destination_name, location, description, image_url, req.params.id);
        res.json({ message: 'Destination updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/destinations/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM destinations WHERE destination_id = ?').run(req.params.id);
        res.json({ message: 'Destination deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// REVENUE REPORTS
router.get('/reports/revenue', (req, res) => {
    try {
        const revenueByMonth = db.prepare(`
            SELECT strftime('%Y-%m', booking_date) as month, SUM(total_amount) as revenue
            FROM bookings
            WHERE status = 'Confirmed'
            GROUP BY month
            ORDER BY month DESC
        `).all();
        res.json(revenueByMonth);
    } catch (err) {
        console.error("Revenue Report Error", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ALL BOOKINGS (Admin)
router.get('/bookings', (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT b.booking_id, b.user_id, b.booking_date, b.travel_date, b.total_amount, b.status, b.item_type,
                   u.name as user_name, u.email as user_email,
                   COALESCE(p.title, h.name, t.city || ' ' || t.type) as package_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            LEFT JOIN packages p ON b.item_type = 'Package' AND b.item_id = p.id
            LEFT JOIN hotels h ON b.item_type = 'Hotel' AND b.item_id = h.id
            LEFT JOIN taxis t ON b.item_type = 'Taxi' AND b.item_id = t.id
            ORDER BY b.booking_date DESC
        `).all();
        res.json(bookings);
    } catch (err) {
        console.error("Admin Bookings Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// USER STATUS MANAGEMENT (Block/Unblock)
router.put('/users/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        db.prepare('UPDATE users SET status = ? WHERE user_id = ?').run(status, req.params.id);
        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PACKAGE MODERATION
router.get('/packages/pending', (req, res) => {
    try {
        const p = db.prepare("SELECT p.*, u.name as agent_name FROM packages p JOIN users u ON p.agent_id = u.user_id WHERE p.status = 'Pending'").all();
        res.json(p);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/packages/:id/status', (req, res) => {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    try {
        db.prepare('UPDATE packages SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json({ message: `Package ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// AGENT REGISTRATION APPROVAL
router.get('/agents/registrations', (req, res) => {
    try {
        // Find users with role 'Agent' but status 'Inactive' or 'Pending' (if we add 'Pending')
        // For now, let's assume Agents are created as 'Inactive' and need approval to become 'Active'
        const agents = db.prepare("SELECT user_id as id, name, email, created_at FROM users WHERE role = 'Agent' AND status = 'Inactive'").all();
        res.json(agents);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
