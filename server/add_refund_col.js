
import { db } from './database.js';

console.log("Adding refund_status column to bookings table...");

try {
    const tableInfo = db.prepare("PRAGMA table_info(bookings)").all();
    const hasRefundColumn = tableInfo.some(col => col.name === 'refund_status');

    if (!hasRefundColumn) {
        db.prepare("ALTER TABLE bookings ADD COLUMN refund_status TEXT").run();
        console.log("Successfully added refund_status column.");
    } else {
        console.log("Column refund_status already exists.");
    }
} catch (err) {
    console.error("Error updating bookings table:", err);
}
