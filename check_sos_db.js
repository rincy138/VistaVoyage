
import { db } from './server/database.js';

try {
    const confirmedBookings = db.prepare("SELECT * FROM bookings WHERE status = 'Confirmed'").all();
    console.log('Confirmed Bookings count:', confirmedBookings.length);
    if (confirmedBookings.length > 0) {
        console.log('First confirmed booking:', confirmedBookings[0]);
    }

    const allBookings = db.prepare("SELECT status, count(*) as count FROM bookings GROUP BY status").all();
    console.log('Booking statuses:', allBookings);

} catch (err) {
    console.error('Error checking database:', err);
}
