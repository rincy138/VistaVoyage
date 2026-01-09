import express from 'express';
import { db } from '../database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure only Admin access
router.use(authenticateToken, authorizeRole(['Admin']));

// Get all users
router.get('/users', (req, res) => {
    try {
        const users = db.prepare('SELECT user_id as id, name, email, role, created_at FROM users').all();
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
    try {
        const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const totalAgents = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "Agent"').get().count;
        const totalDestinations = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
        const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
        const totalRevenue = db.prepare('SELECT SUM(total_amount) as sum FROM bookings WHERE status = "Booked"').get().sum || 0;

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

// Get Pending Agents
router.get('/agents/pending', (req, res) => {
    try {
        const pendingAgents = db.prepare(`
            SELECT u.user_id as id, u.name, u.email, ta.agency_name, ta.license_no, ta.approval_status
            FROM users u
            JOIN travel_agents ta ON u.user_id = ta.agent_id
            WHERE ta.approval_status = 'Pending'
        `).all();
        res.json(pendingAgents);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve/Reject Agent
router.put('/agents/:id/approve', (req, res) => {
    const { status } = req.body; // 'Approved' or 'Rejected' (could be 'Pending' too)
    if (!['Approved', 'Pending'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        db.prepare('UPDATE travel_agents SET approval_status = ? WHERE agent_id = ?').run(status, req.params.id);
        res.json({ message: `Agent status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
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

    if (destination_name.trim().length < 2) {
        return res.status(400).json({ message: 'Destination name must be at least 2 characters long' });
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

    if (!destination_name || !location) {
        return res.status(400).json({ message: 'Destination name and location are required' });
    }

    if (destination_name.trim().length < 2) {
        return res.status(400).json({ message: 'Destination name must be at least 2 characters long' });
    }

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

// EVENTS CRUD
router.get('/events', (req, res) => {
    try {
        const events = db.prepare(`
            SELECT e.*, d.destination_name 
            FROM events e
            JOIN destinations d ON e.destination_id = d.destination_id
        `).all();
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/events', (req, res) => {
    const { destination_id, event_name, event_date, description } = req.body;
    try {
        const result = db.prepare(`
            INSERT INTO events (destination_id, event_name, event_date, description)
            VALUES (?, ?, ?, ?)
        `).run(destination_id, event_name, event_date, description);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Event created' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/events/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM events WHERE event_id = ?').run(req.params.id);
        res.json({ message: 'Event deleted' });
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
            WHERE status = 'Booked'
            GROUP BY month
            ORDER BY month DESC
        `).all();
        res.json(revenueByMonth);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ALL BOOKINGS (Admin)
router.get('/bookings', (req, res) => {
    try {
        const bookings = db.prepare(`
            SELECT b.*, u.name as user_name, u.email as user_email, p.title as package_name, p.destination
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            JOIN packages p ON b.package_id = p.id
            ORDER BY b.booking_date DESC
        `).all();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
