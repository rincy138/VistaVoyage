import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const festivals = db.prepare('SELECT name, image_url FROM festivals').all();
console.log('Current Festivals in DB:');
festivals.forEach(f => {
    console.log(`- Name: "${f.name}"`);
    console.log(`  URL:  ${f.image_url}`);
});

const updates = [
    {
        name: "Sonepur Mela",
        url: "https://images.unsplash.com/photo-1599335804683-16a3a9856a64?auto=format&fit=crop&w=1200&q=80"
    },
    {
        name: "Hornbill Festival",
        url: "https://images.unsplash.com/photo-1593113115760-4927233261a8?auto=format&fit=crop&w=1200&q=80"
    }
];

console.log('\nUpdating...');
const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');
for (const item of updates) {
    const result = stmt.run(item.url, item.name);
    console.log(`Updated "${item.name}": ${result.changes} rows affected.`);
}

db.close();
