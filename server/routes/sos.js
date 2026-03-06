import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Trigger SOS
router.post('/trigger', authenticateToken, (req, res) => {
    const { location, timestamp } = req.body;
    const userId = req.user.id;

    console.log(`[SOS] Triggered by user ${userId}`);

    try {
        // 1. Get User Info
        const user = db.prepare('SELECT name, email, phone, emergency_contact_name, emergency_contact_phone FROM users WHERE user_id = ?').get(userId);

        if (!user) {
            console.error(`[SOS] User ${userId} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Get Active/Recent Booking Details
        // We look for 'Confirmed' or 'Booked' packages closest to 'now'
        let activeBooking = null;
        try {
            activeBooking = db.prepare(`
                SELECT b.*, p.title as package_name, p.destination, u.name as agent_name, u.email as agent_email, u.phone as agent_phone
                FROM bookings b
                JOIN packages p ON b.item_id = p.id
                JOIN users u ON p.agent_id = u.user_id
                WHERE b.user_id = ? AND b.item_type = 'Package' AND b.status IN ('Confirmed', 'Booked')
                ORDER BY ABS(strftime('%s', b.travel_date) - strftime('%s', 'now')) ASC
                LIMIT 1
            `).get(userId);

            if (activeBooking) {
                console.log(`[SOS] Linked to booking #${activeBooking.booking_id} (${activeBooking.package_name})`);
            }
        } catch (err) {
            console.warn('[SOS] Failed to fetch active booking:', err.message);
        }

        const lat = location?.lat ?? 0;
        const lng = location?.lng ?? 0;

        // 3. Log the SOS Signal to the database
        const sosRecord = db.prepare(`
            INSERT INTO sos_alerts (user_id, latitude, longitude, booking_id)
            VALUES (?, ?, ?, ?)
        `).run(userId, lat, lng, activeBooking?.booking_id || null);

        // 4. Record as a high-priority notification for admins/agents
        db.prepare(`
            INSERT INTO notifications (user_id, message, status)
            VALUES (?, ?, ?)
        `).run(userId, `🚨 URGENT: SOS Signal triggered by ${user.name}! Location: ${lat}, ${lng}`, 'Unread');

        // If an agent is linked, notify them too
        if (activeBooking && activeBooking.agent_email) {
            // Find the agent's user_id from their email or the join
            const agent = db.prepare('SELECT user_id FROM users WHERE email = ?').get(activeBooking.agent_email);
            if (agent) {
                db.prepare(`
                    INSERT INTO notifications (user_id, message, status)
                    VALUES (?, ?, ?)
                `).run(agent.user_id, `🚨 URGENT: Your client ${user.name} (Booking #${activeBooking.booking_id}) has triggered an SOS signal!`, 'Unread');
            }
        }

        // 5. Response with all synthesized data for the frontend to show confirmation
        res.json({
            success: true,
            message: 'SOS Signal Broadcasted Successfully',
            data: {
                traveler: {
                    name: user.name,
                    phone: user.phone,
                    emergency_contact: {
                        name: user.emergency_contact_name || 'Not Set',
                        phone: user.emergency_contact_phone || 'Not Set'
                    }
                },
                booking: activeBooking ? {
                    id: activeBooking.booking_id,
                    package: activeBooking.package_name,
                    destination: activeBooking.destination
                } : null,
                agent: activeBooking ? {
                    name: activeBooking.agent_name,
                    phone: activeBooking.agent_phone
                } : null,
                location: { lat, lng }
            }
        });

    } catch (err) {
        console.error('[SOS] Error triggering SOS:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to trigger SOS signal',
            error: err.message
        });
    }
});

// Update Emergency Contact Info
router.put('/contact', authenticateToken, (req, res) => {
    const { name, phone } = req.body;
    try {
        db.prepare('UPDATE users SET emergency_contact_name = ?, emergency_contact_phone = ? WHERE user_id = ?')
            .run(name, phone, req.user.id);
        res.json({ success: true, message: 'Emergency contact updated' });
    } catch (err) {
        res.status(500).json({ message: 'Database error' });
    }
});

export default router;
