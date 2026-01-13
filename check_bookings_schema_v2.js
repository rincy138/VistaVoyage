import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const schema = db.prepare("PRAGMA table_info(bookings)").all();
for (const col of schema) {
    console.log(`${col.name} (${col.type})`);
}
db.close();
