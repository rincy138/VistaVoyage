import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import fs from 'fs';
import { sendBookingNotifications } from '../services/notificationService.js';

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, async (req, res) => {
    const { itemId, itemType, travelDate, totalAmount, adults, children, city, fullName, email, phone, address, location, pickUpAddress, dropAddress, ageBreakdown, passengerDetails } = req.body;
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

        // Calculate total guests from breakdown if available, else fallback
        const guestCounts = ageBreakdown || { adults: adults || 1, children: children || 0 };
        const totalGuests = Object.values(guestCounts).reduce((a, b) => a + b, 0);

        // Log the values being inserted for debugging
        console.log('Creating booking with:', { user_id, itemId, itemType, travelDate, totalAmount, guestCounts, totalGuests });

        // Simple confirmation
        const info = db.prepare(`
            INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, adults, children, passenger_details, address, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booked')
        `).run(
            user_id,
            itemId,
            itemType,
            travelDate,
            totalAmount,
            totalGuests,
            guestCounts.adults || (adults || 1),
            (guestCounts.kids || 0) + (guestCounts.teens || 0) + (guestCounts.youngAdults || 0) + (guestCounts.infants || 0) + (children || 0),
            passengerDetails,
            address || (itemType === 'Taxi' ? pickUpAddress : '')
        );

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

        // Fallback: If email is not in request body, try to get it from database
        let notificationEmail = email;
        let notificationName = fullName || 'Valued Customer';

        if (!notificationEmail) {
            try {
                const userDetails = db.prepare('SELECT email, name FROM users WHERE user_id = ?').get(user_id);
                if (userDetails && userDetails.email) {
                    notificationEmail = userDetails.email;
                    notificationName = userDetails.name || notificationName;
                    console.log(`[Booking] Recovered missing email from DB: ${notificationEmail}`);
                }
            } catch (e) {
                console.error("Failed to fetch user email fallback", e);
            }
        }

        // Send email confirmation
        if (notificationEmail) {
            const notificationData = {
                email: notificationEmail,
                fullName: notificationName,
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

            fs.appendFileSync('email_debug_log.txt', `${new Date().toISOString()} - [Booking] Initiating email to ${notificationEmail}\n`);

            // Send email notification asynchronously (don't wait for completion)
            sendBookingNotifications(notificationData)
                .then(results => {
                    console.log('📧 Email notification results:', results);
                    fs.appendFileSync('email_debug_log.txt', `${new Date().toISOString()} - [Booking] Email sent success: ${JSON.stringify(results)}\n`);
                })
                .catch(err => {
                    console.error('❌ Error sending email notification:', err);
                    fs.appendFileSync('email_debug_log.txt', `${new Date().toISOString()} - [Booking] Email sent FAILURE: ${err.message}\n`);
                });
        } else {
            console.warn(`[Booking Debug] No email address provided in booking request. Skipping confirmation email. User ID: ${user_id}`);
            fs.appendFileSync('email_debug_log.txt', `${new Date().toISOString()} - [Booking] SKIPPED email. No address found.\n`);
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
router.get('/', authenticateToken, (req, res) => {
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
                WHEN b.item_type = 'Package' THEN (SELECT destination FROM packages WHERE id = b.item_id)
                WHEN b.item_type = 'Hotel' THEN (SELECT city FROM hotels WHERE id = b.item_id)
                WHEN b.item_type = 'Taxi' THEN (SELECT city FROM taxis WHERE id = b.item_id)
            END as city,
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

router.get('/my-bookings', authenticateToken, (req, res) => {
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
                WHEN b.item_type = 'Package' THEN (SELECT destination FROM packages WHERE id = b.item_id)
                WHEN b.item_type = 'Hotel' THEN (SELECT city FROM hotels WHERE id = b.item_id)
                WHEN b.item_type = 'Taxi' THEN (SELECT city FROM taxis WHERE id = b.item_id)
            END as city,
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
router.put('/:id/cancel', authenticateToken, async (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    try {
        // Fetch booking details including item name for email
        const booking = db.prepare(`
            SELECT b.*, u.email, u.name as fullName,
    CASE 
                WHEN b.item_type = 'Package' THEN(SELECT title FROM packages WHERE id = b.item_id)
                WHEN b.item_type = 'Hotel' THEN(SELECT name FROM hotels WHERE id = b.item_id)
                WHEN b.item_type = 'Taxi' THEN(SELECT type FROM taxis WHERE id = b.item_id)
END as item_name
            FROM bookings b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.booking_id = ? AND b.user_id = ?
    `).get(booking_id, user_id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Proper Validation: Cannot cancel past trips or already cancelled ones
        const travelDate = new Date(booking.travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (travelDate < today) {
            return res.status(400).json({ message: 'Cannot cancel a trip that has already passed or is currently in progress.' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'This booking is already cancelled.' });
        }

        db.prepare('UPDATE bookings SET status = ? WHERE booking_id = ?').run('Cancelled', booking_id);

        // Send Cancellation Email
        if (booking.email) {
            console.log(`[Email Debug] Attempting to send cancellation email to: ${booking.email} `);
            // Import dynamically to avoid circular dependencies if any, though here it's fine
            const { sendCancellationEmail } = await import('../services/notificationService.js');

            sendCancellationEmail({
                email: booking.email,
                fullName: booking.fullName || 'Traveler',
                itemType: booking.item_type,
                itemName: booking.item_name,
                bookingId: booking_id
            }).then(result => console.log('[Email Debug] Send result:', result))
                .catch(err => console.error("[Email Debug] Failed to call sendCancellationEmail:", err));
        } else {
            console.warn(`[Email Debug] Booking ${booking_id} has no email associated.`);
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request a refund
router.post('/:id/refund', authenticateToken, (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;

    try {
        const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?').get(booking_id, user_id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'Cancelled') {
            return res.status(400).json({ message: 'Only cancelled bookings are eligible for a refund request.' });
        }

        if (booking.refund_status) {
            return res.status(400).json({ message: `A refund request for this booking is already ${booking.refund_status}.` });
        }

        const travelDate = new Date(booking.travel_date);
        const today = new Date();
        const diffTime = travelDate.getTime() - today.getTime();
        const diffHours = diffTime / (1000 * 60 * 60);

        let refundPercentage = 0;
        let refundAmount = 0;
        let refundMessage = '';

        if (booking.total_amount <= 0) {
            return res.status(400).json({ message: 'This booking has no paid amount to refund.' });
        }

        if (diffHours >= 168) { // More than 7 days
            refundPercentage = 100;
            refundAmount = booking.total_amount;
            refundMessage = 'Eligible for 100% refund (Full refund for cancellations > 7 days).';
        } else if (diffHours >= 48) { // More than 48 hours
            refundPercentage = 50;
            refundAmount = booking.total_amount * 0.5;
            refundMessage = 'Eligible for 50% refund (Partial refund for cancellations > 48 hours).';
        } else {
            return res.status(400).json({
                message: 'No refund eligible. Refund requests must be made at least 48 hours before the trip date.'
            });
        }

        db.prepare(`
            UPDATE bookings 
            SET refund_status = ?,
    refund_amount = ?,
    refund_percentage = ?
        WHERE booking_id = ?
            `).run('Processing', refundAmount, refundPercentage, booking_id);

        res.json({
            message: `Refund request submitted successfully! ${refundMessage} `,
            refundAmount: refundAmount,
            refundPercentage: refundPercentage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update booking details (passenger details, billing address)
router.patch('/:id', authenticateToken, (req, res) => {
    const booking_id = req.params.id;
    const user_id = req.user.id;
    const { passengerDetails, address } = req.body;

    try {
        const booking = db.prepare('SELECT * FROM bookings WHERE booking_id = ? AND user_id = ?').get(booking_id, user_id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (passengerDetails !== undefined) {
            db.prepare('UPDATE bookings SET passenger_details = ? WHERE booking_id = ?').run(passengerDetails, booking_id);
        }

        if (address !== undefined) {
            db.prepare('UPDATE bookings SET address = ? WHERE booking_id = ?').run(address, booking_id);
        }

        res.json({ message: 'Booking updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
