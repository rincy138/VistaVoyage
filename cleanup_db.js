
import { db } from './server/database.js';

console.log('--- Database Cleanup Started ---');

try {
    // Turn off foreign keys for cleanup
    db.exec('PRAGMA foreign_keys = OFF');

    // 1. Identify Orphaned Bookings
    const orphans = db.prepare(`
        SELECT booking_id FROM bookings 
        WHERE (item_type = 'Package' AND item_id NOT IN (SELECT id FROM packages))
        OR (item_type = 'Hotel' AND item_id NOT IN (SELECT id FROM hotels))
        OR (item_type = 'Taxi' AND item_id NOT IN (SELECT id FROM taxis))
    `).all();

    if (orphans.length > 0) {
        console.log(`Found ${orphans.length} orphaned bookings. Cleaning up...`);

        const orphanIds = orphans.map(o => o.booking_id);
        const placeholders = orphanIds.map(() => '?').join(',');

        // 2. Clear associated records
        db.prepare(`DELETE FROM emotional_reflections WHERE booking_id IN (${placeholders})`).run(...orphanIds);
        db.prepare(`DELETE FROM sos_alerts WHERE booking_id IN (${placeholders})`).run(...orphanIds);

        // 3. Delete the bookings themselves
        const result = db.prepare(`DELETE FROM bookings WHERE booking_id IN (${placeholders})`).run(...orphanIds);
        console.log(`Successfully removed ${result.changes} records.`);
    } else {
        console.log('No orphaned bookings found.');
    }

    // Turn foreign keys back on
    db.exec('PRAGMA foreign_keys = ON');

} catch (err) {
    console.error("Cleanup failed:", err.message);
}

console.log('--- Cleanup Complete ---');
