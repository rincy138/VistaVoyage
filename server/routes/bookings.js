import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, (req, res) => {
    const { itemId, itemType, travelDate, totalAmount, guests, city } = req.body;
    const user_id = req.user.id;

    if (!itemId || !itemType || !travelDate || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Simple confirmation
        const info = db.prepare(`
            INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Confirmed')
        `).run(user_id, itemId, itemType, travelDate, totalAmount, guests || 1);

        // Update User Stats
        const user = db.prepare('SELECT total_kms, cities_visited FROM users WHERE user_id = ?').get(user_id);
        let currentKms = parseFloat(user.total_kms || 0);
        let visitedArr = JSON.parse(user.cities_visited || '[]');

        // If it's a taxi, add simulated KMs (e.g., 50km for city tours)
        if (itemType === 'Taxi') {
            currentKms += 50;
        }

        // Add city to unique visited list
        if (city && !visitedArr.includes(city)) {
            visitedArr.push(city);
        }

        db.prepare('UPDATE users SET total_kms = ?, cities_visited = ? WHERE user_id = ?')
            .run(currentKms, JSON.stringify(visitedArr), user_id);

        res.status(201).json({
            message: 'Booking successful',
            booking_id: info.lastInsertRowid
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bookings for the logged-in user
router.get(['/', '/my-bookings'], authenticateToken, (req, res) => {
    const user_id = req.user.id;

    try {
        const bookings = db.prepare(`
            SELECT b.*,
            CASE 
                WHEN b.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = b.item_id)
                WHEN b.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = b.item_id)
                WHEN b.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = b.item_id)
            END as item_name,
            CASE 
                WHEN b.item_type = 'Package' THEN (SELECT image_url FROM packages WHERE id = b.item_id)
                WHEN b.item_type = 'Hotel' THEN (SELECT image FROM hotels WHERE id = b.item_id)
                WHEN b.item_type = 'Taxi' THEN (SELECT image FROM taxis WHERE id = b.item_id)
            END as image
            FROM bookings b
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
        const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(booking_id, user_id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run('Cancelled', booking_id);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
