import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('--- FAVORITES TABLE ---');
try {
    const favorites = db.prepare('SELECT * FROM favorites').all();
    console.log('Total favorites:', favorites.length);
    console.log('Favorites sample:', favorites.slice(0, 5));

    // Check types
    if (favorites.length > 0) {
        console.log('Type of item_id for first favorite:', typeof favorites[0].item_id);
    }

    const joins = db.prepare(`
        SELECT f.*, 
        CASE 
            WHEN f.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = f.item_id)
            WHEN f.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = f.item_id)
            WHEN f.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = f.item_id)
            WHEN f.item_type = 'Destination' THEN f.item_id
        END as title
        FROM favorites f
    `).all();
    console.log('Joins sample:', joins.slice(0, 5));
} catch (err) {
    console.error('Error querying favorites:', err.message);
}

db.close();
