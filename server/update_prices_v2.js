import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Updating prices for high-value packages to be below 30,000...');

const updates = [
    { title: 'Andaman', price: 29500 },
    { title: 'Lakshadweep', price: 29900 }
];

const updateStmt = db.prepare('UPDATE packages SET price = ? WHERE title = ?');

updates.forEach(u => {
    const info = updateStmt.run(u.price, u.title);
    if (info.changes > 0) {
        console.log(`✅ Updated ${u.title}: set price to ${u.price}`);
    } else {
        console.log(`⚠️ Could not find package: ${u.title}`);
    }
});

console.log('Price update complete.');
