import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT user_id, name, email, role, phone, profile_picture, bio, total_kms, cities_visited, emergency_contact_name, emergency_contact_phone FROM users WHERE user_id = ?').get(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Ensure cities_visited is parsed
        user.cities_visited = JSON.parse(user.cities_visited || '[]');
        res.json(user);
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
    const { name, email, phone, bio, profile_picture, emergency_contact_name, emergency_contact_phone } = req.body;
    try {
        // Get current user data
        const currentUser = db.prepare('SELECT name, email, phone, bio, profile_picture, emergency_contact_name, emergency_contact_phone FROM users WHERE user_id = ?').get(req.user.id);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Use provided values or keep existing ones
        const updatedName = name !== undefined ? name : currentUser.name;
        const updatedEmail = email !== undefined ? email : currentUser.email;
        const updatedPhone = phone !== undefined ? phone : currentUser.phone;
        const updatedBio = bio !== undefined ? bio : currentUser.bio;
        const updatedProfilePicture = profile_picture !== undefined ? profile_picture : currentUser.profile_picture;
        const updatedEmergencyName = emergency_contact_name !== undefined ? emergency_contact_name : currentUser.emergency_contact_name;
        const updatedEmergencyPhone = emergency_contact_phone !== undefined ? emergency_contact_phone : currentUser.emergency_contact_phone;

        db.prepare('UPDATE users SET name = ?, email = ?, phone = ?, bio = ?, profile_picture = ?, emergency_contact_name = ?, emergency_contact_phone = ? WHERE user_id = ?')
            .run(updatedName, updatedEmail, updatedPhone, updatedBio, updatedProfilePicture, updatedEmergencyName, updatedEmergencyPhone, req.user.id);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        console.error("Error updating profile:", err);
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email already in use by another account.' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET all favorites for user
router.get('/favorites', authenticateToken, (req, res) => {
    try {
        const favorites = db.prepare(`
            SELECT f.*, 
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN f.item_id
            END as title,
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT image_url FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT image FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT image FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN (SELECT image_url FROM destinations WHERE destination_name = f.item_id)
            END as image
            FROM favorites f 
            WHERE f.user_id = ?
        `).all(req.user.id);
        res.json(favorites);
    } catch (err) {
        console.error("Error fetching favorites:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Check if item is favorited
router.get('/favorites/check/:itemType/:itemId', authenticateToken, (req, res) => {
    const { itemType, itemId } = req.params;
    try {
        const existing = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?')
            .get(req.user.id, String(itemId), itemType);
        res.json({ isFavorite: !!existing });
    } catch (err) {
        console.error("Error checking favorite:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Add/Remove favorite
router.post('/favorites/toggle', authenticateToken, (req, res) => {
    const { itemId, itemType } = req.body;
    const stringItemId = String(itemId);
    try {
        const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND item_id = ? AND item_type = ?')
            .get(req.user.id, stringItemId, itemType);

        if (existing) {
            db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
            res.json({ message: 'Removed from favorites', action: 'removed' });
        } else {
            db.prepare('INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)')
                .run(req.user.id, stringItemId, itemType);
            res.json({ message: 'Added to favorites', action: 'added' });
        }
    } catch (err) {
        console.error('Error toggling favorite:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// GET user travel milestones
router.get('/milestones', authenticateToken, (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = db.prepare(`
            SELECT b.*, p.title, p.destination, p.mood_tags, p.duration as pkg_duration
            FROM bookings b
            JOIN packages p ON b.item_id = p.id
            WHERE b.user_id = ? AND b.status = 'Confirmed' AND b.item_type = 'Package'
            ORDER BY b.travel_date ASC
        `).all(userId);

        const milestones = [];
        const indianStates = ['kerala', 'rajasthan', 'himachal', 'kashmir', 'ladakh', 'goa', 'karnataka', 'andaman', 'sikkim', 'assam', 'meghalaya', 'arunachal', 'nagaland', 'manipur', 'mizoram', 'tripura', 'up', 'uttarakhand', 'punjab', 'delhi', 'maharashtra', 'telangana', 'andhra', 'tamil nadu', 'gujarat', 'mp', 'bihar', 'odisha', 'wb', 'jharkhand', 'chhattisgarh', 'haryana'];

        // First Solo Trip
        const firstSolo = bookings.find(b => b.guests === 1);
        if (firstSolo) {
            milestones.push({
                type: 'First Solo Trip',
                date: firstSolo.travel_date,
                title: firstSolo.title,
                icon: 'User'
            });
        }

        // Island Discovery (Andaman/Lakshadweep)
        const firstIsland = bookings.find(b => {
            const dest = b.destination.toLowerCase();
            return dest.includes('andaman') || dest.includes('lakshadweep');
        });
        if (firstIsland) {
            milestones.push({
                type: 'Island Discovery',
                date: firstIsland.travel_date,
                title: firstIsland.title,
                icon: 'Globe'
            });
        }

        // Longest Trip
        if (bookings.length > 0) {
            const longest = bookings.reduce((max, b) => {
                const days = parseInt(b.pkg_duration) || 0;
                const maxDays = parseInt(max.pkg_duration) || 0;
                return days > maxDays ? b : max;
            }, bookings[0]);

            milestones.push({
                type: 'Longest Trip',
                date: longest.travel_date,
                title: `${longest.title} (${longest.pkg_duration})`,
                icon: 'Map'
            });
        }

        // Most Adventurous Trip
        const mostAdventurous = bookings.find(b => b.mood_tags && b.mood_tags.toLowerCase().includes('adventure'));
        if (mostAdventurous) {
            milestones.push({
                type: 'Most Adventurous Trip',
                date: mostAdventurous.travel_date,
                title: mostAdventurous.title,
                icon: 'Compass'
            });
        }

        res.json(milestones);
    } catch (err) {
        console.error("Error fetching milestones:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
