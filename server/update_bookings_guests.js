import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Starting migration to add adults and children columns...');

try {
    // Check if columns already exist
    const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
    const hasAdults = tableInfo.some(col => col.name === 'adults');
    const hasChildren = tableInfo.some(col => col.name === 'children');

    if (!hasAdults && !hasChildren) {
        // Add new columns
        db.exec(`
            ALTER TABLE bookings ADD COLUMN adults INTEGER DEFAULT 1;
            ALTER TABLE bookings ADD COLUMN children INTEGER DEFAULT 0;
        `);

        // Migrate existing data: set adults = guests, children = 0
        db.prepare(`
            UPDATE bookings 
            SET adults = guests, children = 0 
            WHERE adults IS NULL
        `).run();

        console.log('✓ Successfully added adults and children columns');
        console.log('✓ Migrated existing bookings data');
    } else {
        console.log('Columns already exist, skipping migration');
    }

    // Display updated schema
    const updatedInfo = db.prepare("PRAGMA table_info(bookings)").all();
    console.log('\nUpdated bookings table schema:');
    updatedInfo.forEach(col => {
        console.log(`  - ${col.name}: ${col.type}`);
    });

} catch (err) {
    console.error('Migration failed:', err);
} finally {
    db.close();
}
