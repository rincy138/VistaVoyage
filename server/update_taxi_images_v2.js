import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Updating taxi images...');

// New image URLs
const sedanImage = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop';
const suvImage = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop';

const updateStmt = db.prepare('UPDATE taxis SET image = ? WHERE type = ?');

const updates = [
    { type: 'Sedan (Premium)', image: sedanImage },
    { type: 'SUV (Luxury)', image: suvImage }
];

updates.forEach(u => {
    const info = updateStmt.run(u.image, u.type);
    if (info.changes > 0) {
        console.log(`✅ Updated ${info.changes} entries for ${u.type}`);
    } else {
        console.log(`⚠️ No entries found for ${u.type}`);
    }
});

console.log('Taxi images updated successfully.');
