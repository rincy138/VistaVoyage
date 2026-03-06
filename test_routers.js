
import express from 'express';
import taxiRoutes from './server/routes/taxis.js';
import hotelRoutes from './server/routes/hotels.js';
import chatbotRoutes from './server/routes/chatbot.js';
import bookingRoutes from './server/routes/bookings.js';

const app = express();

try {
    app.use('/taxis', taxiRoutes);
    console.log('Taxis OK');
    app.use('/hotels', hotelRoutes);
    console.log('Hotels OK');
    app.use('/chatbot', chatbotRoutes);
    console.log('Chatbot OK');
    app.use('/bookings', bookingRoutes);
    console.log('Bookings OK');
} catch (err) {
    console.error('Crash during route attachment:', err);
    process.exit(1);
}
console.log('All routers attached successfully');
