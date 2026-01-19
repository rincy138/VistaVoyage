
import { db } from './database.js';

console.log("Adding image_url column to reviews table...");

try {
    const tableInfo = db.prepare("PRAGMA table_info(reviews)").all();
    const hasImageColumn = tableInfo.some(col => col.name === 'image_url');

    if (!hasImageColumn) {
        db.prepare("ALTER TABLE reviews ADD COLUMN image_url TEXT").run();
        console.log("Successfully added image_url column.");
    } else {
        console.log("Column image_url already exists.");
    }
} catch (err) {
    console.error("Error updating reviews table:", err);
}
