import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const row = db.prepare('SELECT title, image_url FROM packages WHERE title = ?').get('Thekkady');
console.log('--- Thekkady in packages ---');
console.log(JSON.stringify(row, null, 2));

const all = db.prepare('SELECT count(*) as count FROM packages').get();
console.log('Total packages:', all.count);

const nullImages = db.prepare('SELECT count(*) as count FROM packages WHERE image_url IS NULL OR image_url = ""').get();
console.log('Packages with null/empty images:', nullImages.count);

const someRows = db.prepare('SELECT title, image_url FROM packages LIMIT 10').all();
console.log('--- Sample 10 rows ---');
someRows.forEach(r => console.log(`${r.title}: ${r.image_url}`));
