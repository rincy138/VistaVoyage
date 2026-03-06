import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const updates = [
    { name: "Pushkar Camel Fair", location: "Pushkar, Rajasthan" },
    { name: "Sonepur Mela", location: "Sonepur, Bihar" },
    { name: "Rann Utsav", location: "Kutch, Gujarat" },
    { name: "Hornbill Festival", location: "Kohima, Nagaland" },
    { name: "Surajkund International Crafts Mela", location: "Faridabad, Haryana" }
];

const stmt = db.prepare('UPDATE festivals SET location = ? WHERE name = ?');

db.transaction(() => {
    for (const item of updates) {
        stmt.run(item.location, item.name);
    }
})();

console.log("Festival locations fixed in database.");
db.close();
