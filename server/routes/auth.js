import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../database.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper for email validation
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

// Register User
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    // Simple validation
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    if (name.trim().length < 2) {
        return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if role is valid (optional security check)
    const validRoles = ['Traveler', 'Agent', 'Admin'];
    let userRole = validRoles.includes(role) ? role : 'Traveler';

    // Security Restriction: Only specific email can register as Admin
    if (userRole === 'Admin' && email.toLowerCase() !== 'traveladmin@gmail.com') {
        return res.status(403).json({ message: 'Registration failed: Only traveladmin@gmail.com is authorized to register as Admin.' });
    }

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
        const token = jwt.sign({ id: info.lastInsertRowid, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

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
        const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.user_id,
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

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        // Security: Even if user doesn't exist, return success message
        if (!user) {
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?')
            .run(resetToken, tokenExpiry, email);

        // Dyamically determine frontend URL from request origin to allow any IP/address
        const frontendUrl = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - VistaVoyage',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #3b82f6; text-align: center;">VistaVoyage</h2>
                    <p>Hello,</p>
                    <p>You requested a password reset for your VistaVoyage account. Please click the button below to reset your password. This link is valid for 1 hour.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">${resetUrl}</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #999; text-align: center;">&copy; 2025 VistaVoyage Travel Systems</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`\n[EMAIL SENT] To: ${email} | Link: ${resetUrl}\n`);

        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const now = new Date().toISOString();
        if (user.reset_token_expiry < now) {
            return res.status(400).json({ message: 'Token has expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Update password and clear token
        db.prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?')
            .run(hashedPassword, user.user_id);

        res.json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client('447614601176-i2ltgsltol78dv8kn7thvt44c9mmjq35.apps.googleusercontent.com');

// Google Login
router.post('/google-login', async (req, res) => {
    const { token } = req.body;
    console.log('Received Google login request with token length:', token ? token.length : 0);

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
            user = { user_id: info.lastInsertRowid, name, email, role: 'Traveler' };
        }

        const jwtToken = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token: jwtToken,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        console.error("Google Auth detailed error:", err);
        res.status(400).json({ message: `Google authentication failed: ${err.message}` });
    }
});

export default router;
