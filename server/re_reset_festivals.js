import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

// IDs:
// Pushkar: 1590766944548-d218290bfc8b
// Sonepur: 1523731407965-243ffecaa080
// Rann: 1590765610237-9dec8377be83
// Hornbill: 1626014303757-611634b07fb5
// Surajkund: 1510798831971-661eb04b3739

const updates = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?auto=format&fit=crop&w=1000" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?auto=format&fit=crop&w=1000" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?auto=format&fit=crop&w=1000" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?auto=format&fit=crop&w=1000" },
    { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000" }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');
db.transaction(() => {
    for (const item of updates) {
        stmt.run(item.url, item.name);
    }
})();

console.log("Festivals wiped and reset with clean URLs.");
const verify = db.prepare('SELECT name, image_url FROM festivals').all();
verify.forEach(v => console.log(`${v.name}: ${v.image_url}`));

db.close();
