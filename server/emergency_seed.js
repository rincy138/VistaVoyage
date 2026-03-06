import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log("DELETING ALL FESTIVALS...");
db.prepare('DELETE FROM festivals').run();

const data = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?w=1200" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1599335804683-16a3a9856a64?w=1200" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?w=1200" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1593113115760-4927233261a8?w=1200" },
    { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200" }
];

const insert = db.prepare('INSERT INTO festivals (name, location, start_date, end_date, description, type, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');

data.forEach(f => {
    insert.run(f.name, "Generic Location", "2026-11-01", "2026-12-30", "Description here", "Mela", f.url);
    console.log(`INSERTED: ${f.name} with URL ${f.url}`);
});

db.close();
console.log("DONE");
