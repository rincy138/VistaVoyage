import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, (req, res) => {
    const { packageId, travelDate, totalAmount, customDuration } = req.body;
    const user_id = req.user.id;

    if (!packageId || !travelDate || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Check if package exists
        const pkg = db.prepare('SELECT id, available_slots FROM packages WHERE id = ?').get(packageId);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check if travel date is in the future
        const selectedDate = new Date(travelDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for date comparison

        if (selectedDate < today) {
            return res.status(400).json({ message: 'Travel date must be in the future' });
        }

        if (totalAmount <= 0) {
            return res.status(400).json({ message: 'Invalid total amount' });
        }

        const info = db.prepare(`
            INSERT INTO bookings (user_id, package_id, travel_date, total_amount, custom_duration, status)
            VALUES (?, ?, ?, ?, ?, 'Booked')
        `).run(user_id, packageId, travelDate, totalAmount, customDuration || null);

        res.status(201).json({
            message: 'Booking successful',
            booking_id: info.lastInsertRowid
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bookings for the logged-in user (Compatible with both / and /my-bookings)
router.get(['/', '/my-bookings'], authenticateToken, (req, res) => {
    const user_id = req.user.id;

    try {
        const bookings = db.prepare(`
            SELECT b.*, p.title as package_name, p.image_url, p.destination, 
            COALESCE(b.custom_duration, p.duration) as display_duration
            FROM bookings b
            JOIN packages p ON b.package_id = p.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `).all(user_id);

        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel a booking
router.put('/:id/cancel', authenticateToken, (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    try {
        const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?').get(booking_id, user_id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        db.prepare('UPDATE bookings SET status = ? WHERE booking_id = ?').run('Cancelled', booking_id);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
