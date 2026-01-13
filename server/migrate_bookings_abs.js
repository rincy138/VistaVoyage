import Database from 'better-sqlite3';
import path from 'path';

const dbPath = 'c:\\Users\\josep\\OneDrive\\Documents\\GitHub\\VistaVoyage\\server\\data\\vistavoyage.db';
console.log('Opening database at:', dbPath);

try {
    const db = new Database(dbPath);
    console.log('Database opened successfully!');

    console.log('Migrating bookings table...');
    db.prepare('ALTER TABLE bookings RENAME TO bookings_old').run();
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

    db.prepare('DROP TABLE bookings_old').run();
    console.log('Migration complete!');
    db.close();
} catch (err) {
    console.error('Operation failed:', err.message);
}
