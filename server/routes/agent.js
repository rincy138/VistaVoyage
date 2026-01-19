
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
        // Get all packages owned by this agent
        const packages = db.prepare('SELECT id, title, price FROM packages WHERE agent_id = ?').all(agentId);
        const packageIds = packages.map(p => p.id);

        if (packageIds.length === 0) {
            return res.json({
                stats: { totalBookings: 0, totalEarnings: 0, pendingRequests: 0, activePackages: 0 },
                bookings: [],
                recentActivity: []
            });
        }

        // Get bookings for these packages
        // We use placeholders for the IN clause
        const placeholders = packageIds.map(() => '?').join(',');

        const bookings = db.prepare(`
            SELECT b.id, b.user_id, b.booking_date, b.travel_date, b.guests, b.total_amount, b.status,
                   p.title as package_title, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
            FROM bookings b
            JOIN packages p ON b.item_id = p.id
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_type = 'Package' 
            AND b.item_id IN (${placeholders})
            ORDER BY b.booking_date DESC
        `).all(...packageIds);

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
            packages // Sending basic package list for quick dropdowns if needed
        });

    } catch (err) {
        console.error("Agent Dashboard Error:", err);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

// 2. Update Booking Status (Accept/Reject)
router.put('/bookings/:id/status', requireAgent, (req, res) => {
    const { status } = req.body; // 'Confirmed' or 'Cancelled' (Reject usually maps to Cancelled or Rejected)
    const bookingId = req.params.id;
    const agentId = req.user.id;

    if (!['Confirmed', 'Cancelled', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        // Verify this booking belongs to a package owned by the agent
        const booking = db.prepare(`
            SELECT b.id 
            FROM bookings b
            JOIN packages p ON b.item_id = p.id
            WHERE b.id = ? AND p.agent_id = ? AND b.item_type = 'Package'
        `).get(bookingId, agentId);

        if (!booking) {
            return res.status(403).json({ message: 'Not authorized to manage this booking' });
        }

        // Update status
        db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, bookingId);

        // TODO: Send email notification to user about status change (Mocked for now)

        res.json({ message: `Booking marked as ${status}` });

    } catch (err) {
        console.error("Update Booking Error:", err);
        res.status(500).json({ message: 'Server error updating booking' });
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

export default router;
