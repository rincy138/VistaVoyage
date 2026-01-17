import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

console.log(`Connecting to DB at: ${dbPath}`);
const db = new Database(dbPath);

try {
    const columns = db.pragma('table_info(bookings)');
    console.log('Current columns:', columns.map(c => c.name));

    const hasItemId = columns.some(c => c.name === 'item_id');
    const hasItemType = columns.some(c => c.name === 'item_type');

    if (!hasItemId) {
        console.log('Adding item_id column...');
        // Default to package_id if it exists, else 0
        const hasPackageId = columns.some(c => c.name === 'package_id');
        const defaultVal = hasPackageId ? 'package_id' : '0';

        // SQLite ADD COLUMN cannot use column reference in default, but we can update after
        db.prepare('ALTER TABLE bookings ADD COLUMN item_id INTEGER DEFAULT 0').run();

        if (hasPackageId) {
            console.log('Migrating package_id to item_id...');
            db.prepare('UPDATE bookings SET item_id = package_id').run();
        }
    }

    if (!hasItemType) {
        console.log('Adding item_type column...');
        db.prepare("ALTER TABLE bookings ADD COLUMN item_type TEXT DEFAULT 'Package'").run();
    }

    // Also check guests?
    const hasGuests = columns.some(c => c.name === 'guests');
    if (!hasGuests) {
        console.log('Adding guests column...');
        db.prepare('ALTER TABLE bookings ADD COLUMN guests INTEGER DEFAULT 1').run();
    }

    console.log('Fix complete.');
} catch (err) {
    console.error('Error fixing DB:', err);
}
