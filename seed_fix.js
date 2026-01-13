import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

try {
    console.log('Dropping hotels and taxis tables to ensure fresh schema...');
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('DROP TABLE IF EXISTS hotels');
    db.exec('DROP TABLE IF EXISTS taxis');
    db.exec('PRAGMA foreign_keys = ON');
    db.close();

    console.log('Manually triggering DB initialization...');
    initDb();
    console.log('Done.');
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
process.exit(0);
