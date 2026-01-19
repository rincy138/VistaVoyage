import express from 'express';
import { db } from '../database.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all packages (Public)
router.get('/', (req, res) => {
    try {
        const packages = db.prepare('SELECT * FROM packages').all();
        res.json(packages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get package by ID
router.get('/:id', (req, res) => {
    try {
        const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });
        res.json(pkg);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create Package (Agent/Admin only)
router.post('/', authenticateToken, authorizeRole(['Agent', 'Admin']), (req, res) => {
    const {
        title, description, destination, price, duration, image_url, available_slots,
        itinerary, inclusions, exclusions, safety_info, emergency_info,
        safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
    } = req.body;

    if (!title || !destination || !price) {
        return res.status(400).json({ message: 'Please provide required fields (title, destination, price)' });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({ message: 'Title must be at least 3 characters long' });
    }

    if (destination.trim().length < 2) {
        return res.status(400).json({ message: 'Destination must be at least 2 characters long' });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 100) {
        return res.status(400).json({ message: 'Price must be a valid number and at least 100' });
    }

    const slots = parseInt(available_slots || 10);
    if (isNaN(slots) || slots < 0) {
        return res.status(400).json({ message: 'Available slots must be a valid number' });
    }

    try {
        const info = db.prepare(`
      INSERT INTO packages (
        agent_id, title, description, destination, price, duration, image_url, available_slots,
        itinerary, inclusions, exclusions, safety_info, emergency_info,
        safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            req.user.id, title, description, destination, price, duration, image_url, available_slots,
            itinerary, inclusions, exclusions, safety_info, emergency_info,
            safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
        );

        res.status(201).json({ id: info.lastInsertRowid, ...req.body });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Package (Agent/Admin only)
router.put('/:id', authenticateToken, authorizeRole(['Agent', 'Admin']), (req, res) => {
    const {
        title, description, destination, price, duration, image_url, available_slots,
        itinerary, inclusions, exclusions, safety_info, emergency_info,
        safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
    } = req.body;
    const packageId = req.params.id;

    if (!title || !destination || !price) {
        return res.status(400).json({ message: 'Please provide required fields (title, destination, price)' });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({ message: 'Title must be at least 3 characters long' });
    }

    if (destination.trim().length < 2) {
        return res.status(400).json({ message: 'Destination must be at least 2 characters long' });
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 100) {
        return res.status(400).json({ message: 'Price must be a valid number and at least 100' });
    }

    const slots = parseInt(available_slots || 0); // Allow 0 for updates
    if (isNaN(slots) || slots < 0) {
        return res.status(400).json({ message: 'Available slots must be a valid number' });
    }

    try {
        const pkg = db.prepare('SELECT agent_id FROM packages WHERE id = ?').get(packageId);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        if (req.user.role === 'Agent' && pkg.agent_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only update your own packages' });
        }

        db.prepare(`
      UPDATE packages 
      SET title = ?, description = ?, destination = ?, price = ?, duration = ?, image_url = ?, available_slots = ?,
          itinerary = ?, inclusions = ?, exclusions = ?, safety_info = ?, emergency_info = ?,
          safety_score = ?, crowd_level = ?, eco_score = ?, mood_tags = ?, accessibility_info = ?, festival_info = ?
      WHERE id = ?
    `).run(
            title, description, destination, price, duration, image_url, available_slots,
            itinerary, inclusions, exclusions, safety_info, emergency_info,
            safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info,
            packageId
        );

        res.json({ message: 'Package updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Package (Agent/Admin only)
router.delete('/:id', authenticateToken, authorizeRole(['Agent', 'Admin']), (req, res) => {
    const packageId = req.params.id;

    try {
        // Check ownership if Agent
        const pkg = db.prepare('SELECT agent_id FROM packages WHERE id = ?').get(packageId);
        if (!pkg) return res.status(404).json({ message: 'Package not found' });

        if (req.user.role === 'Agent' && pkg.agent_id !== req.user.id) {
            return res.status(403).json({ message: 'You can only delete your own packages' });
        }

        db.prepare('DELETE FROM packages WHERE id = ?').run(packageId);
        res.json({ message: 'Package deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
