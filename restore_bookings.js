
import { db } from './server/database.js';

const userId = 1;
const cities = ["Munnar", "Ooty", "Manali", "Gandikota"];

console.log('--- Restoring Bookings ---');

try {
    for (const city of cities) {
        // Find a package for this city
        const pkg = db.prepare("SELECT id, title, price FROM packages WHERE destination LIKE ? OR title LIKE ? LIMIT 1")
            .get(`%${city}%`, `%${city}%`);

        if (pkg) {
            console.log(`Restoring Package booking for ${city}...`);
            db.prepare(`
                INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, status, booking_date)
                VALUES (?, ?, 'Package', '2026-03-15', ?, 2, 'Confirmed', '2026-02-20')
            `).run(userId, pkg.id, pkg.price);
        }

        // Find a hotel for this city
        const hotel = db.prepare("SELECT id, name, price FROM hotels WHERE city LIKE ? OR location LIKE ? LIMIT 1")
            .get(`%${city}%`, `%${city}%`);

        if (hotel) {
            console.log(`Restoring Hotel booking in ${city}...`);
            db.prepare(`
                INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, status, booking_date)
                VALUES (?, ?, 'Hotel', '2026-03-16', ?, 2, 'Confirmed', '2026-02-21')
            `).run(userId, hotel.id, hotel.price);
        }

        // Find a taxi for this city
        const taxi = db.prepare("SELECT id, type, price_per_km FROM taxis WHERE city LIKE ? LIMIT 1")
            .get(`%${city}%`);

        if (taxi) {
            console.log(`Restoring Taxi booking in ${city}...`);
            db.prepare(`
                INSERT INTO bookings (user_id, item_id, item_type, travel_date, total_amount, guests, status, booking_date)
                VALUES (?, ?, 'Taxi', '2026-03-17', ?, 2, 'Confirmed', '2026-02-22')
            `).run(userId, taxi.id, taxi.price_per_km * 50);
        }
    }
    console.log('--- Restoration Complete ---');
} catch (err) {
    console.error("Restoration failed:", err.message);
}
