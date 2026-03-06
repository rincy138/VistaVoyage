import { db } from './database.js';

console.log('Adding address column to bookings table...');

try {
    db.prepare('ALTER TABLE bookings ADD COLUMN address TEXT').run();
    console.log('Successfully added address column to bookings table.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Address column already exists.');
    } else {
        console.error('Failed to add address column:', err.message);
    }
}
