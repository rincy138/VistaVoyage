import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

for (const table of tables) {
    const tableName = table.name;
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const foreignKeys = db.prepare(`PRAGMA foreign_key_list(${tableName})`).all();

    console.log(`--- TABLE: ${tableName} ---`);
    console.log('Columns:', JSON.stringify(columns, null, 2));
    console.log('Foreign Keys:', JSON.stringify(foreignKeys, null, 2));
}
