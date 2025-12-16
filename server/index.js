import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database.js';
import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/packages', packagesRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'VistaVoyage API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
