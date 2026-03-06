import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name='festivals'").get();
console.log("SCHEMA START");
console.log(schema.sql);
console.log("SCHEMA END");

const cols = db.prepare("PRAGMA table_info(festivals)").all();
console.log("COLUMNS:");
console.log(JSON.stringify(cols, null, 2));

db.close();
