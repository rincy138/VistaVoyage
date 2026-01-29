
import express from 'express';
import { db } from '../database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Middleware to ensure user is an Agent or Admin
const requireAgent = [authenticateToken, authorizeRole(['Agent', 'Admin'])];

// 1. Get Agent Dashboard Stats & Bookings
router.get('/dashboard', requireAgent, (req, res) => {
    const agentId = req.user.id;

    try {
        // Get all packages owned by this agent (still useful for stats/management)
        const packages = db.prepare('SELECT id, title, price FROM packages WHERE agent_id = ?').all(agentId);

        // Fetch ALL bookings (Packages, Hotels, Taxis) - acting as Super Agent/Manager for demo purposes
        const bookings = db.prepare(`
            SELECT b.booking_id as id, b.user_id, b.booking_date, b.travel_date, b.guests, b.total_amount, b.status,
                   COALESCE(p.title, h.name, t.city || ' ' || t.type) as package_title,
                   u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            LEFT JOIN packages p ON b.item_type = 'Package' AND b.item_id = p.id
            LEFT JOIN hotels h ON b.item_type = 'Hotel' AND b.item_id = h.id
            LEFT JOIN taxis t ON b.item_type = 'Taxi' AND b.item_id = t.id
            ORDER BY b.booking_date DESC
        `).all();

        // Calculate Stats
        const stats = {
            totalBookings: bookings.length,
            totalEarnings: bookings
                .filter(b => b.status === 'Confirmed')
                .reduce((sum, b) => sum + (b.total_amount || 0), 0),
            pendingRequests: bookings.filter(b => b.status === 'Booked' || b.status === 'Pending').length,
            activePackages: packages.length
        };

        res.json({
            stats,
            bookings,
            packages
        });

    } catch (err) {
        console.error("Agent Dashboard Error:", err);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

// 2. Update Booking Status (Accept/Reject)
router.put('/bookings/:id/status', requireAgent, (req, res) => {
    let { status } = req.body;
    const bookingId = req.params.id;
    // const agentId = req.user.id; // Removed strict ownership check for seamless demo

    if (!['Confirmed', 'Cancelled', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Map 'Rejected' to 'Cancelled' to satisfy DB CHECK constraints
    if (status === 'Rejected') {
        status = 'Cancelled';
    }

    try {
        // Check if booking starts with # (frontend visual ID might have it, but route params shouldn't if parsed correctly)
        // Assuming bookingId is integer ID

        const booking = db.prepare('SELECT booking_id FROM bookings WHERE booking_id = ?').get(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update status
        db.prepare('UPDATE bookings SET status = ? WHERE booking_id = ?').run(status, bookingId);

        // TODO: Send email notification to user about status change (Mocked for now)

        res.json({ message: `Booking marked as ${status}` });

    } catch (err) {
        console.error("Update Booking Error:", err);
        res.status(500).json({ message: `Server error updating booking: ${err.message}` });
    }
});

// 3. Get Agent's Reviews
router.get('/reviews', requireAgent, (req, res) => {
    const agentId = req.user.id;
    try {
        const reviews = db.prepare(`
            SELECT r.*, p.title as package_title, u.name as user_name
            FROM reviews r
            JOIN packages p ON r.item_id = p.id
            JOIN users u ON r.user_id = u.user_id
            WHERE r.item_type = 'Package' AND p.agent_id = ?
            ORDER BY r.review_date DESC
        `).all(agentId);

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
});

// 4. Get All Destinations (For Agent to manage)
router.get('/destinations', requireAgent, (req, res) => {
    try {
        const destinations = db.prepare('SELECT * FROM destinations').all();
        res.json(destinations);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching destinations' });
    }
});

// 5. Update Destination (Agent)
router.put('/destinations/:id', requireAgent, (req, res) => {
    const { destination_name, location, description, image_url } = req.body;
    const destId = req.params.id;

    if (!destination_name || !location) {
        return res.status(400).json({ message: 'Destination name and location are required' });
    }

    try {
        db.prepare(`
            UPDATE destinations 
            SET destination_name = ?, location = ?, description = ?, image_url = ?
            WHERE destination_id = ?
        `).run(destination_name, location, description, image_url, destId);

        res.json({ message: 'Destination updated successfully' });
    } catch (err) {
        console.error("Update Destination Error:", err);
        res.status(500).json({ message: 'Server error updating destination' });
    }
});

// 6. Get All Travelers (For Agent to manage)
router.get('/users', requireAgent, (req, res) => {
    try {
        const users = db.prepare("SELECT user_id as id, name, email, role, status, created_at FROM users WHERE role = 'Traveler'").all();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
});

// 7. Update Traveler Status (Block/Unblock)
router.put('/users/:id/status', requireAgent, (req, res) => {
    const { status } = req.body;
    const userId = req.params.id;

    if (!['Active', 'Inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        db.prepare('UPDATE users SET status = ? WHERE user_id = ? AND role = \'Traveler\'').run(status, userId);
        res.json({ message: `User status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user status' });
    }
});

// 8. Delete Traveler
router.delete('/users/:id', requireAgent, (req, res) => {
    const userId = req.params.id;
    try {
        // satisfaction of foreign key constraints is handled by db if ON DELETE CASCADE is set, 
        // but let's be safe or check schema.
        const result = db.prepare('DELETE FROM users WHERE user_id = ? AND role = \'Traveler\'').run(userId);
        if (result.changes === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error("Delete User Error:", err);
        res.status(500).json({ message: 'Server error deleting user' });
    }
});

// 9. Get Agent's Messages
router.get('/messages', requireAgent, (req, res) => {
    const agentId = req.user.id;
    try {
        const messages = db.prepare(`
            SELECT m.*, u.name as sender_name, u.email as sender_email
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.receiver_id = ?
            ORDER BY m.created_at DESC
        `).all(agentId);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// 10. Send/Reply to Message
router.post('/messages/compose', requireAgent, (req, res) => {
    const sender_id = req.user.id;
    const { receiver_id, subject, message } = req.body;

    if (!receiver_id || !message) {
        return res.status(400).json({ message: 'Receiver and message content required' });
    }

    try {
        db.prepare('INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)').run(sender_id, receiver_id, subject, message);
        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error sending message' });
    }
});

export default router;
