import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

const hotels = db.prepare("SELECT name, type, price FROM hotels WHERE city = 'Coimbatore'").all();

if (hotels.length > 0) {
    console.log('Hotels in Coimbatore:');
    hotels.forEach(h => console.log(`- ${h.name} (${h.type}): ₹${h.price}`));
} else {
    console.log('No hotels found for Coimbatore.');
}
