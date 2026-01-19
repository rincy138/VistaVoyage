
import { db } from './server/database.js';

console.log("Inspecting 'bookings' table schema...");
const columns = db.pragma('table_info(bookings)');
console.log(columns);

console.log("Inspecting 'bookings' constraints...");
// We can't easily see check constraints via pragma in all sqlite versions, but we can see sql
const sql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'").get();
console.log(sql.sql);

// Check if 'Cancelled' is valid status
try {
    // Insert dummy row to test status constraint if possible, but rollback
    // actually, let's just check existing statuses
    const statuses = db.prepare("SELECT DISTINCT status FROM bookings").all();
    console.log("Existing statuses:", statuses);
} catch (e) {
    console.log("Error checking statuses:", e);
}
