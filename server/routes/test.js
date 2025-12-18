import express from 'express';

const router = express.Router();

// GET /api/test
router.get('/', (req, res) => {
    res.json({ message: 'Hello from Node.js! The server is working correctly.' });
});

export default router;
