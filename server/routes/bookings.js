import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import { sendBookingNotifications } from '../services/notificationService.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
    const { itemId, itemType, travelDate, totalAmount, adults, children, city, fullName, email, phone, location, pickUpAddress, dropAddress } = req.body;
    const user_id = req.user.id;

    if (!itemId || !itemType || !travelDate || !totalAmount) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        // Validate that the item exists before creating booking
        let itemExists = false;
        let itemName = '';

        if (itemType === 'Package') {
            const pkg = db.prepare('SELECT title FROM packages WHERE id = ?').get(itemId);
            itemExists = pkg;
            itemName = pkg?.title || '';
        } else if (itemType === 'Hotel') {
            const hotel = db.prepare('SELECT name FROM hotels WHERE id = ?').get(itemId);
            itemExists = hotel;
            itemName = hotel?.name || '';
        } else if (itemType === 'Taxi') {
            const taxi = db.prepare('SELECT type FROM taxis WHERE id = ?').get(itemId);
            itemExists = taxi;
            itemName = taxi?.type || '';
        }

        if (!itemExists) {
            return res.status(404).json({ message: `${itemType} not found with ID ${itemId}` });
        }

        // Verify user exists
        const userExists = db.prepare('SELECT 1 FROM users WHERE user_id = ?').get(user_id);
        if (!userExists) {
            console.error(`User not found: user_id=${user_id}`);
            return res.status(404).json({ message: 'User not found. Please log in again.' });
        }

        // Calculate total guests
        const totalGuests = (adults || 1) + (children || 0);

        // Log the values being inserted for debugging
        console.log('Creating booking with:', { user_id, itemId, itemType, travelDate, totalAmount, adults, children, totalGuests });

        // Simple confirmation
        const info = db.prepare(`
            INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, adults, children, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Booked')
        `).run(user_id, itemId, itemType, travelDate, totalAmount, totalGuests, adults || 1, children || 0);

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

        // Send email confirmation
        if (email) {
            const notificationData = {
                email: email,
                fullName: fullName || 'Valued Customer',
                itemType: itemType,
                itemName: itemName,
                travelDate: travelDate,
                totalAmount: totalAmount,
                adults: adults || 1,
                children: children || 0,
                bookingId: info.lastInsertRowid,
                city: city,
                location: location || pickUpAddress || dropAddress
            };

            // Send email notification asynchronously (don't wait for completion)
            sendBookingNotifications(notificationData)
                .then(results => {
                    console.log('📧 Email notification results:', results);
                })
                .catch(err => {
                    console.error('❌ Error sending email notification:', err);
                    // Don't fail the booking if email fails
                });
        }

        res.status(201).json({
            message: 'Booking successful',
            booking_id: info.lastInsertRowid
        });
    } catch (err) {
        console.error('Booking Error Details:', err);
        console.error('Error code:', err.code);
        fs.appendFileSync('server_error_log.txt', `${new Date().toISOString()} - Booking Error: ${err.message}\n${err.stack}\n`);
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
