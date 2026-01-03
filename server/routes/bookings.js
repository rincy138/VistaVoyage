import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, (req, res) => {
    const { packageId, travelDate, totalAmount } = req.body;
    const user_id = req.user.id;

    if (!packageId || !travelDate || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        const info = db.prepare(`
            INSERT INTO bookings (user_id, package_id, travel_date, total_amount, status)
            VALUES (?, ?, ?, ?, 'Booked')
        `).run(user_id, packageId, travelDate, totalAmount);

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
            SELECT b.*, p.title as package_name, p.image_url, p.destination, p.duration
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
