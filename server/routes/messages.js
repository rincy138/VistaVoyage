import express from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 1. Get list of all agents (for travelers to start a chat)
router.get('/agents', authenticateToken, (req, res) => {
    try {
        const agents = db.prepare("SELECT user_id as id, name, email, profile_picture, status FROM users WHERE role = 'Agent'").all();
        res.json(agents);
    } catch (err) {
        console.error("Error fetching agents:", err);
        res.status(500).json({ message: 'Server error fetching agents' });
    }
});

// 2. Get messages between current user and another user
router.get('/:otherId', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const otherId = req.params.otherId;

    try {
        const messages = db.prepare(`
            SELECT m.*, u.name as sender_name 
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `).all(userId, otherId, otherId, userId);

        // Mark messages as read if the recipient is the current user
        db.prepare('UPDATE messages SET status = \'Read\' WHERE receiver_id = ? AND sender_id = ?').run(userId, otherId);

        res.json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

// 3. Get all conversations summary (for dashboard)
router.get('/conversations/list', authenticateToken, (req, res) => {
    const userId = req.user.id;
    try {
        const conversations = db.prepare(`
            SELECT 
                u.user_id as id, 
                u.name, 
                u.email, 
                u.profile_picture,
                u.role,
                (SELECT message FROM messages WHERE (sender_id = u.user_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.user_id) ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT created_at FROM messages WHERE (sender_id = u.user_id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.user_id) ORDER BY created_at DESC LIMIT 1) as last_message_time,
                (SELECT COUNT(*) FROM messages WHERE sender_id = u.user_id AND receiver_id = ? AND status = 'Unread') as unread_count
            FROM users u
            WHERE u.user_id IN (
                SELECT DISTINCT receiver_id FROM messages WHERE sender_id = ?
                UNION
                SELECT DISTINCT sender_id FROM messages WHERE receiver_id = ?
            )
            ORDER BY last_message_time DESC
        `).all(userId, userId, userId, userId, userId, userId, userId);

        res.json(conversations);
    } catch (err) {
        console.error("Error fetching conversations:", err);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
});

// 4. Send a message
router.post('/send', authenticateToken, (req, res) => {
    const sender_id = req.user.id;
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
        return res.status(400).json({ message: 'Receiver and message content are required' });
    }

    try {
        const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)').run(sender_id, receiver_id, message);

        const newMessage = {
            id: result.lastInsertRowid,
            sender_id,
            receiver_id,
            message,
            status: 'Unread',
            created_at: new Date().toISOString()
        };

        res.status(201).json(newMessage);
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

export default router;
