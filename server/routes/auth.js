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
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''
    },
    tls: {
        rejectUnauthorized: false
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

// Forgot Password - Step 1: Send OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        // Security: Even if user doesn't exist, return success message
        if (!user) {
            return res.json({ message: 'If an account exists, an OTP has been sent to your email.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiry = new Date(Date.now() + 600000).toISOString(); // 10 minutes for OTP

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?')
            .run(otp, tokenExpiry, email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP - VistaVoyage',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #3b82f6; text-align: center;">VistaVoyage</h2>
                    <p>Hello,</p>
                    <p>Your OTP for password reset is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 2.5rem; font-weight: bold; letter-spacing: 5px; color: #3b82f6; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${otp}</span>
                    </div>
                    <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8rem; color: #999; text-align: center;">&copy; 2025 VistaVoyage Travel Systems</p>
                </div>
            `
        };

        console.log(`\n[OTP GENERATED] To: ${email} | OTP: ${otp}\n`);

        try {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL SENT SUCCESS] To: ${email}`);
        } catch (mailErr) {
            console.error(`[EMAIL SENT FAILURE] ${mailErr.message}`);
        }

        res.json({ message: 'If an account exists, an OTP has been sent to your email.' });
    } catch (err) {
        console.error('Fatal Forgot Password Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP - Step 2: Validate OTP and return a secure session token
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ? AND reset_token = ?').get(email, otp);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const now = new Date().toISOString();
        if (user.reset_token_expiry < now) {
            return res.status(400).json({ message: 'OTP has expired' });
        }

        // Generate a strong temporary token for the actual reset
        const secureToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour for the link

        db.prepare('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?')
            .run(secureToken, tokenExpiry, email);

        res.json({ success: true, token: secureToken });
    } catch (err) {
        console.error('Verify OTP Error:', err);
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
