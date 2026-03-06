import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log("Cleaning festivals table...");
db.prepare('DELETE FROM festivals').run();

const festivalsData = [
    { name: "Pushkar Camel Fair", location: "Pushkar, Rajasthan", start_date: "2026-11-18", end_date: "2026-11-26", description: "One of the world's largest camel fairs, featuring livestock trade, cultural performances, and desert activities.", type: "Mela", image_url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?auto=format&fit=crop&w=1200&q=80" },
    { name: "Sonepur Mela", location: "Sonepur, Bihar", start_date: "2026-11-22", end_date: "2026-12-22", description: "Asia's largest cattle fair, held on the banks of the River Ganges.", type: "Mela", image_url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?auto=format&fit=crop&w=1200&q=80" },
    { name: "Rann Utsav", location: "Kutch, Gujarat", start_date: "2026-11-01", end_date: "2027-02-28", description: "A white desert carnival with music, dance, and handicrafts under the moonlight.", type: "Cultural", image_url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?auto=format&fit=crop&w=1200&q=80" },
    { name: "Hornbill Festival", location: "Kohima, Nagaland", start_date: "2026-12-01", end_date: "2026-12-10", description: "The festival of festivals, showcasing the rich culture of Naga tribes.", type: "Cultural", image_url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?auto=format&fit=crop&w=1200&q=80" },
    { name: "Surajkund International Crafts Mela", location: "Faridabad, Haryana", start_date: "2026-02-01", end_date: "2026-02-15", description: "A showcase of traditional handicrafts and cultural heritage from across India.", type: "Mela", image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80" }
];

const insert = db.prepare('INSERT INTO festivals (name, location, start_date, end_date, description, type, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');

db.transaction(() => {
    for (const f of festivalsData) {
        insert.run(f.name, f.location, f.start_date, f.end_date, f.description, f.type, f.image_url);
    }
})();

console.log("Festivals re-seeded successfully.");
db.close();
