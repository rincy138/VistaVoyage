import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log("Dropping and re-creating festivals table with TEXT column...");
db.prepare('DROP TABLE IF EXISTS festivals').run();
db.prepare(`
    CREATE TABLE festivals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(150) NOT NULL,
      start_date DATE,
      end_date DATE,
      description TEXT,
      type TEXT CHECK(type IN ('Mela', 'Religious', 'Cultural', 'Food')) NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

const data = [
    {
        name: "Pushkar Camel Fair",
        location: "Pushkar, Rajasthan",
        start_date: "2026-11-18",
        end_date: "2026-11-26",
        description: "The world's largest cattle fair featuring thousands of camels, folk music, and vibrant desert culture.",
        type: "Mela",
        image_url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Sonepur Mela",
        location: "Sonepur, Bihar",
        start_date: "2026-11-22",
        end_date: "2026-12-22",
        description: "India's legendary elephant fair on the banks of the Ganges, showcasing majestic animals and local traditions.",
        type: "Mela",
        image_url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Rann Utsav",
        location: "Kutch, Gujarat",
        start_date: "2026-11-01",
        end_date: "2027-02-28",
        description: "A breathtaking white salt desert festival filled with music, dance, and handicrafts under the full moon.",
        type: "Cultural",
        image_url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Hornbill Festival",
        location: "Kohima, Nagaland",
        start_date: "2026-12-01",
        end_date: "2026-12-10",
        description: "The 'Festival of Festivals' celebrating the rich tribal heritage and warrior traditions of Nagaland.",
        type: "Cultural",
        image_url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?auto=format&fit=crop&q=80&w=800"
    },
    {
        name: "Surajkund International Crafts Mela",
        location: "Faridabad, Haryana",
        start_date: "2026-02-01",
        end_date: "2026-02-15",
        description: "An international showcase of traditional handicrafts, handlooms, and folk art from every corner of India.",
        type: "Mela",
        image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800"
    }
];

const insert = db.prepare('INSERT INTO festivals (name, location, start_date, end_date, description, type, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)');

db.transaction(() => {
    for (const f of data) {
        insert.run(f.name, f.location, f.start_date, f.end_date, f.description, f.type, f.image_url);
    }
})();

console.log("Database reset and re-seeded with CORRECT images and data.");
db.close();
