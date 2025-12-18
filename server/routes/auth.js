import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Check if role is valid (optional security check)
    const validRoles = ['Traveler', 'Agent', 'Admin'];
    const userRole = validRoles.includes(role) ? role : 'Traveler';

    try {
        // Check for existing user
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const info = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, userRole);

        // Create JWT token
        const token = jwt.sign({ id: info.lastInsertRowid, role: userRole }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            token,
            user: {
                id: info.lastInsertRowid,
                name,
                email,
                role: userRole
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        // Check for user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Forgot Password (Mock)
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
        // Security: Don't reveal if user exists
        return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 15);
    console.log(`\n[EMAIL MOCK] To: ${email} | Subject: Password Reset | Link: http://localhost:5173/reset-password/${resetToken}\n`);

    res.json({ message: 'If an account exists, a reset link has been sent.' });
});

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client('447614601176-i2ltgsltol78dv8kn7thvt44c9mmjq35.apps.googleusercontent.com');

// Google Login
router.post('/google-login', async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: '447614601176-i2ltgsltol78dv8kn7thvt44c9mmjq35.apps.googleusercontent.com'
        });
        const { name, email, picture } = ticket.getPayload();

        let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            // Create new user if not exists
            const password = Math.random().toString(36).slice(-8); // Random password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const info = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashedPassword, 'Traveler');
            user = { id: info.lastInsertRowid, name, email, role: 'Traveler' };
        }

        const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Google Auth failed", err);
        res.status(400).json({ message: 'Google authentication failed' });
    }
});

export default router;
