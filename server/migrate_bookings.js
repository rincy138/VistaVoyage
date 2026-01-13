import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Migrating bookings table to new unified schema...');

try {
    // 1. Rename existing table
    db.prepare('ALTER TABLE bookings RENAME TO bookings_old').run();

    // 2. Create new table with unified schema
    db.prepare(`
        CREATE TABLE bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi')) NOT NULL,
          booking_date DATE DEFAULT CURRENT_DATE,
          travel_date DATE,
          guests INTEGER DEFAULT 1,
          status TEXT CHECK(status IN ('Confirmed', 'Cancelled')) DEFAULT 'Confirmed',
          total_amount DECIMAL(10,2),
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `).run();

    // 3. Migrate data from old table if possible
    // Old columns: booking_id, user_id, package_id, booking_date, travel_date, custom_duration, status, total_amount
    // New columns: id, user_id, item_id, item_type, booking_date, travel_date, guests, status, total_amount
    try {
        db.prepare(`
            INSERT INTO bookings (id, user_id, item_id, item_type, booking_date, travel_date, status, total_amount)
            SELECT booking_id, user_id, package_id, 'Package', booking_date, travel_date, status, total_amount
            FROM bookings_old
        `).run();
        console.log('Successfully migrated bookings data.');
    } catch (e) {
        console.log('Could not migrate old bookings data:', e.message);
    }

    // 4. Drop old table
    db.prepare('DROP TABLE bookings_old').run();

    console.log('Bookings table migration complete!');
} catch (err) {
    console.error('Error during migration:', err.message);
} finally {
    db.close();
}
