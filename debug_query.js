
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server/data/vistavoyage.db');

const db = new Database(dbPath);

try {
    const h = db.prepare("PRAGMA table_info(hotels)").all();
    console.log("Hotels:", h.map(c => c.name));
    const t = db.prepare("PRAGMA table_info(taxis)").all();
    console.log("Taxis:", t.map(c => c.name));

} catch (err) {
    console.error("Error:", err);
}
