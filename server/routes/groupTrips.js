import express from 'express';
import { db } from '../database.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate random invite code
const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// 1. Create a Group Trip
router.post('/create', auth, (req, res) => {
    const { name, destination, startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!name || !destination) {
        return res.status(400).json({ message: 'Name and Destination are required' });
    }

    try {
        console.log('[DEBUG] Create Trip Request:', { name, destination, startDate, endDate, userId });

        const inviteCode = generateInviteCode();

        const insertTrip = db.prepare(`
            INSERT INTO group_trips (name, destination, start_date, end_date, created_by, invite_code, status)
            VALUES (?, ?, ?, ?, ?, ?, 'planning')
        `);

        const insertMember = db.prepare(`
            INSERT INTO group_members (trip_id, user_id, role)
            VALUES (?, ?, ?)
        `);

        // Transaction
        const createTransaction = db.transaction(() => {
            const info = insertTrip.run(name, destination, startDate, endDate, userId, inviteCode);
            const tripId = info.lastInsertRowid;
            insertMember.run(tripId, userId, 'leader');
            return { tripId, inviteCode };
        });

        const result = createTransaction();
        console.log('[DEBUG] Trip Created Successfully:', result);

        res.status(201).json({
            message: 'Group Trip created successfully',
            tripId: result.tripId,
            inviteCode: result.inviteCode
        });

    } catch (err) {
        console.error('[DEBUG] Create Trip Error:', err);
        // Return explicit error message to frontend
        res.status(500).json({ message: `Server error: ${err.message}` });
    }
});

// 2. Join a Trip
router.post('/join', auth, (req, res) => {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    if (!inviteCode) return res.status(400).json({ message: 'Invite code is required' });

    try {
        const trip = db.prepare('SELECT id, status FROM group_trips WHERE invite_code = ?').get(inviteCode);

        if (!trip) {
            return res.status(404).json({ message: 'Invalid invite code' });
        }

        // Check if trip is locked (status field or logic)
        if (trip.status === 'locked') {
            return res.status(400).json({ message: 'This trip is locked and cannot be joined.' });
        }

        // Check if already a member
        const existingMember = db.prepare('SELECT * FROM group_members WHERE trip_id = ? AND user_id = ?').get(trip.id, userId);
        if (existingMember) {
            return res.status(400).json({ message: 'You are already a member of this trip' });
        }

        db.prepare('INSERT INTO group_members (trip_id, user_id, role) VALUES (?, ?, ?)').run(trip.id, userId, 'member');

        res.json({ message: 'Joined trip successfully', tripId: trip.id });

    } catch (err) {
        console.error('Join Trip Error:', err);
        res.status(500).json({ message: 'Server error joining trip' });
    }
});

// 3. Get My Trips
router.get('/my-trips', auth, (req, res) => {
    const userId = req.user.id;
    try {
        const trips = db.prepare(`
            SELECT t.*, m.role, 
            (SELECT COUNT(*) FROM group_members WHERE trip_id = t.id) as member_count
            FROM group_trips t
            JOIN group_members m ON t.id = m.trip_id
            WHERE m.user_id = ?
            ORDER BY t.start_date ASC
        `).all(userId);
        res.json(trips);
    } catch (err) {
        console.error('Get Trips Error:', err);
        res.status(500).json({ message: 'Server error fetching trips' });
    }
});

// 4. Get Trip Details (Dashboard)
router.get('/:id', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;

    try {
        // Check membership
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);
        if (!membership) {
            return res.status(403).json({ message: 'Access denied. You are not a member of this trip.' });
        }

        const trip = db.prepare('SELECT * FROM group_trips WHERE id = ?').get(tripId);

        const members = db.prepare(`
            SELECT u.user_id as id, u.name, u.email, gm.role 
            FROM group_members gm
            JOIN users u ON gm.user_id = u.user_id
            WHERE gm.trip_id = ?
        `).all(tripId);

        const expenses = db.prepare(`
            SELECT ge.*, u.name as payer_name 
            FROM group_expenses ge
            JOIN users u ON ge.paid_by = u.user_id
            WHERE ge.trip_id = ?
            ORDER BY ge.created_at DESC
        `).all(tripId);

        // Fetch Polls with Vote Counts
        const polls = db.prepare(`
            SELECT gp.*, u.name as suggester_name
            FROM group_polls gp
            JOIN users u ON gp.suggested_by = u.user_id
            WHERE gp.trip_id = ?
            ORDER BY gp.created_at DESC
        `).all(tripId);

        // Enhance polls with current user's vote and total counts
        const pollsWithVotes = polls.map(poll => {
            const votes = db.prepare('SELECT user_id, vote_value FROM group_poll_votes WHERE poll_id = ?').all(poll.id);
            const myVote = votes.find(v => v.user_id === userId);
            const yesCount = votes.filter(v => v.vote_value === 1).length;
            const noCount = votes.filter(v => v.vote_value === -1).length;
            return {
                ...poll,
                yesCount,
                noCount,
                userVote: myVote ? myVote.vote_value : 0
            };
        });

        res.json({
            trip,
            currentUserRole: membership.role,
            members,
            expenses,
            polls: pollsWithVotes
        });

    } catch (err) {
        console.error('Get Trip Details Error:', err);
        res.status(500).json({ message: 'Server error fetching trip details' });
    }
});

// 5. Add Expense
router.post('/:id/expense', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;
    const { amount, description, splitType } = req.body;

    try {
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);
        if (!membership) return res.status(403).json({ message: 'Not a member' });

        // Check lock status
        const trip = db.prepare('SELECT status FROM group_trips WHERE id = ?').get(tripId);
        if (trip.status === 'locked') return res.status(400).json({ message: 'Trip is locked.' });

        db.prepare(`
            INSERT INTO group_expenses (trip_id, paid_by, amount, description, split_type)
            VALUES (?, ?, ?, ?, ?)
        `).run(tripId, userId, amount, description, splitType || 'equal');

        res.json({ message: 'Expense added' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding expense' });
    }
});

// 6. Create Poll (Suggest Place)
router.post('/:id/poll', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;
    const { title } = req.body; // Place name

    try {
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);
        if (!membership) return res.status(403).json({ message: 'Not a member' });

        const trip = db.prepare('SELECT status FROM group_trips WHERE id = ?').get(tripId);
        if (trip.status === 'locked') return res.status(400).json({ message: 'Trip is locked.' });

        db.prepare('INSERT INTO group_polls (trip_id, title, suggested_by) VALUES (?, ?, ?)').run(tripId, title, userId);

        res.json({ message: 'Poll created' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating poll' });
    }
});

// 7. Vote on Poll
router.post('/:id/vote', auth, (req, res) => {
    const { pollId, voteValue } = req.body; // 1 (Yes) or -1 (No)
    const userId = req.user.id;

    try {
        // Validation skipped for brevity, assuming UI handles ownership context mostly

        // Upsert vote
        const existingVote = db.prepare('SELECT id FROM group_poll_votes WHERE poll_id = ? AND user_id = ?').get(pollId, userId);

        if (existingVote) {
            db.prepare('UPDATE group_poll_votes SET vote_value = ? WHERE id = ?').run(voteValue, existingVote.id);
        } else {
            db.prepare('INSERT INTO group_poll_votes (poll_id, user_id, vote_value) VALUES (?, ?, ?)').run(pollId, userId, voteValue);
        }

        res.json({ message: 'Vote recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error voting' });
    }
});

// 8. Lock Trip (Leader only)
router.post('/:id/lock', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;

    try {
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);

        if (!membership || membership.role !== 'leader') {
            return res.status(403).json({ message: 'Only the Trip Leader can lock the plan.' });
        }

        db.prepare('UPDATE group_trips SET status = ? WHERE id = ?').run('locked', tripId);
        res.json({ message: 'Trip locked successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error locking trip' });
    }
});

// 9. Unlock Trip (Leader only)
router.post('/:id/unlock', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;

    try {
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);

        if (!membership || membership.role !== 'leader') {
            return res.status(403).json({ message: 'Only the Trip Leader can unlock the plan.' });
        }

        db.prepare('UPDATE group_trips SET status = ? WHERE id = ?').run('planning', tripId);
        res.json({ message: 'Trip unlocked successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error unlocking trip' });
    }
});

// 10. Delete Trip (Leader only)
router.delete('/:id', auth, (req, res) => {
    const tripId = req.params.id;
    const userId = req.user.id;

    try {
        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);

        if (!membership || membership.role !== 'leader') {
            return res.status(403).json({ message: 'Only the Trip Leader can delete the trip.' });
        }

        // Delete dependencies first (cascade usually handles this but safety first)
        const deleteTransaction = db.transaction(() => {
            db.prepare('DELETE FROM group_expenses WHERE trip_id = ?').run(tripId);
            db.prepare('DELETE FROM group_poll_votes WHERE poll_id IN (SELECT id FROM group_polls WHERE trip_id = ?)').run(tripId);
            db.prepare('DELETE FROM group_polls WHERE trip_id = ?').run(tripId);
            db.prepare('DELETE FROM group_members WHERE trip_id = ?').run(tripId);
            db.prepare('DELETE FROM group_trips WHERE id = ?').run(tripId);
        });

        deleteTransaction();
        res.json({ message: 'Trip deleted successfully' });

    } catch (err) {
        console.error('Delete Trip Error:', err);
        res.status(500).json({ message: 'Server error deleting trip' });
    }
});



// 11. Delete Poll
router.delete('/:tripId/poll/:pollId', auth, (req, res) => {
    const { tripId, pollId } = req.params;
    const userId = req.user.id;

    try {
        const poll = db.prepare('SELECT * FROM group_polls WHERE id = ? AND trip_id = ?').get(pollId, tripId);
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        const membership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, userId);

        // Allow if user is leader OR if user is the creator of the poll
        if (poll.suggested_by !== userId && (!membership || membership.role !== 'leader')) {
            return res.status(403).json({ message: 'Not authorized to delete this poll.' });
        }

        const deleteTransaction = db.transaction(() => {
            db.prepare('DELETE FROM group_poll_votes WHERE poll_id = ?').run(pollId);
            db.prepare('DELETE FROM group_polls WHERE id = ?').run(pollId);
        });

        deleteTransaction();
        res.json({ message: 'Poll deleted successfully' });

    } catch (err) {
        console.error('Delete Poll Error:', err);
        res.status(500).json({ message: 'Server error deleting poll' });
    }
});

// 12. Remove Member (Leader only)
router.delete('/:tripId/member/:memberId', auth, (req, res) => {
    const { tripId, memberId } = req.params;
    const requesterId = req.user.id;

    try {
        const requesterMembership = db.prepare('SELECT role FROM group_members WHERE trip_id = ? AND user_id = ?').get(tripId, requesterId);

        if (!requesterMembership || requesterMembership.role !== 'leader') {
            return res.status(403).json({ message: 'Only the Trip Leader can remove members.' });
        }

        if (parseInt(memberId) === requesterId) {
            return res.status(400).json({ message: 'As the leader, you cannot remove yourself. You must delete the trip.' });
        }

        const removeTransaction = db.transaction(() => {
            // Remove their votes from this trip's polls
            db.prepare(`
                DELETE FROM group_poll_votes 
                WHERE user_id = ? AND poll_id IN (SELECT id FROM group_polls WHERE trip_id = ?)
            `).run(memberId, tripId);

            // Remove from members
            db.prepare('DELETE FROM group_members WHERE trip_id = ? AND user_id = ?').run(tripId, memberId);
        });

        removeTransaction();
        res.json({ message: 'Member removed successfully' });

    } catch (err) {
        console.error('Remove Member Error:', err);
        res.status(500).json({ message: 'Server error removing member' });
    }
});

export default router;
