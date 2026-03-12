console.log("VistaVoyage server starting...");
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
import groupTripRoutes from './routes/groupTrips.js';
import vaultRoutes from './routes/vault.js';
import reflectionRoutes from './routes/reflections.js';
import festivalRoutes from './routes/festivals.js';
import sosRoutes from './routes/sos.js';
import messageRoutes from './routes/messages.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Database
try {
    initDb();
} catch (err) {
    console.error("Database initialization error:", err);
}

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
app.use('/api/groups', groupTripRoutes);
app.use('/api/vault', vaultRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/festivals', festivalRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/messages', messageRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'VistaVoyage API is running' });
});

// Serve Frontend in Production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// React router fallback
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.status(404).json({ error: "API route not found" });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Server restart trigger
});