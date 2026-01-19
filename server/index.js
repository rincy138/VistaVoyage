import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { initDb } from './database.js';
import authRoutes from './routes/auth.js';
import packageRoutes from './routes/packages.js';
import adminRoutes from './routes/admin.js';
import bookingRoutes from './routes/bookings.js';
import userRoutes from './routes/users.js';
import reviewRoutes from './routes/reviews.js';
import hotelRoutes from './routes/hotels.js';
import taxiRoutes from './routes/taxis.js';
import testRoutes from './routes/test.js';
import chatbotRoutes from './routes/chatbot.js';
import agentRoutes from './routes/agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Database
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/taxis', taxiRoutes);
app.use('/api/test', testRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/agent', agentRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'VistaVoyage API is running' });
});

// Serve Frontend in Production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route for React Router
app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});