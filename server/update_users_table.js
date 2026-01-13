import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Checking users table for missing columns...');

const tableInfo = db.prepare("PRAGMA table_info(users)").all();
const columnNames = tableInfo.map(c => c.name);

const additions = [];

if (!columnNames.includes('total_kms')) {
    console.log('Adding total_kms column...');
    additions.push("ALTER TABLE users ADD COLUMN total_kms DECIMAL(10,2) DEFAULT 0");
}

if (!columnNames.includes('cities_visited')) {
    console.log('Adding cities_visited column...');
    additions.push("ALTER TABLE users ADD COLUMN cities_visited TEXT DEFAULT '[]'");
}

if (additions.length > 0) {
    try {
        additions.forEach(sql => db.prepare(sql).run());
        console.log('Users table updated successfully!');
    } catch (err) {
        console.error('Error updating users table:', err.message);
    }
} else {
    console.log('Users table already up to date.');
}

db.close();
