import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const festivals = db.prepare('SELECT name, image_url FROM festivals').all();
console.log('--- DB FESTIVAL URLS ---');
festivals.forEach(f => {
    console.log(`NAME: ${f.name}`);
    console.log(`URL:  ${f.image_url}`);
    console.log('------------------------');
});
db.close();
