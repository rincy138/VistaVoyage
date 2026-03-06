import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const updates = [
    {
        name: "Sonepur Mela",
        url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?auto=format&fit=crop&q=80&w=1000"
    },
    {
        name: "Hornbill Festival",
        url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?auto=format&fit=crop&q=80&w=1000"
    },
    {
        name: "Pushkar Camel Fair",
        url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?auto=format&fit=crop&q=80&w=1000"
    },
    {
        name: "Rann Utsav",
        url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?auto=format&fit=crop&q=80&w=1000"
    }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');
db.transaction(() => {
    for (const item of updates) {
        const result = stmt.run(item.url, item.name);
        console.log(`Updated ${item.name}: ${result.changes} row(s)`);
    }
})();

db.close();
console.log("Festival images have been reset to stable, high-quality Unsplash IDs.");
