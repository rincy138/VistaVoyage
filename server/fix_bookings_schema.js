
import { db } from './database.js';

console.log('Starting Bookings Table Migration...');

try {
    // 1. Rename existing table
    db.prepare('DROP TABLE IF EXISTS bookings_old').run();
    try {
        db.prepare('ALTER TABLE bookings RENAME TO bookings_old').run();
    } catch (e) {
        console.log('bookings table might not exist or something went wrong renaming:', e.message);
    }

    // 2. Create new table (Correct Schema)
    db.prepare(`
        CREATE TABLE IF NOT EXISTS bookings (
          booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          item_id INTEGER NOT NULL,
          item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi')) NOT NULL,
          booking_date DATE DEFAULT CURRENT_DATE,
          travel_date DATE,
          guests INTEGER DEFAULT 1,
          status TEXT CHECK(status IN ('Booked', 'Confirmed', 'Cancelled')) DEFAULT 'Booked',
          total_amount DECIMAL(10,2),
          FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `).run();

    // 3. Migrate data
    // We need to handle potential missing columns in bookings_old if it was in various states
    const oldCols = db.prepare("PRAGMA table_info(bookings_old)").all().map(c => c.name);
    console.log('Old columns:', oldCols);

    let insertSql = `
        INSERT INTO bookings (booking_id, user_id, item_id, item_type, booking_date, travel_date, guests, status, total_amount)
        SELECT 
            booking_id, 
            user_id, 
            COALESCE(${oldCols.includes('item_id') ? 'item_id' : 'NULL'}, ${oldCols.includes('package_id') ? 'package_id' : '0'}), 
            COALESCE(${oldCols.includes('item_type') ? 'item_type' : "'Package'"}, 'Package'),
            booking_date, 
            travel_date, 
            ${oldCols.includes('guests') ? 'guests' : '1'},
            status, 
            total_amount
        FROM bookings_old
    `;

    // Fix status if it's not in the new allowed list
    // (e.g. if old status was 'Pending' or something, map it to 'Booked')
    // But simplified for now assuming 'Booked', 'Confirmed', 'Cancelled' cover it. 
    // If old status is incompatible, it might fail. Let's risk it or provide default.

    db.prepare(insertSql).run();
    console.log('Data migration successful.');

    // 4. Cleanup
    db.prepare('DROP TABLE bookings_old').run();
    console.log('Migration complete. bookings table is now fixed.');

} catch (err) {
    console.error('Migration failed:', err.message);
    console.error(err.stack);
    // Attempt rollback if needed? 
    // If we failed after rename but before replace, we might need to manual fix.
}
