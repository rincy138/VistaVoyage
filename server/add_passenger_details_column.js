import { db } from './database.js';

try {
    db.exec("ALTER TABLE bookings ADD COLUMN passenger_details TEXT;");
    console.log("Column 'passenger_details' added successfully to 'bookings' table.");
} catch (err) {
    if (err.message.includes("duplicate column name")) {
        console.log("Column 'passenger_details' already exists.");
    } else {
        console.error("Error adding column:", err.message);
    }
}
process.exit(0);
