import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const rows = db.prepare('SELECT name, image_url FROM festivals').all();
console.log('--- Festival Data in DB ---');
rows.forEach(r => {
    console.log(`Name: ${r.name}`);
    console.log(`URL:  ${r.image_url}`);
    console.log(`Len:  ${r.image_url ? r.image_url.length : 0}`);
    console.log('---------------------------');
});
db.close();
