import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Updating Electric Sedan image...');

// Update all electric sedans to use the new image
const updateStmt = db.prepare('UPDATE taxis SET image = ? WHERE type = ?');
const info = updateStmt.run('/electric_sedan.png', 'Electric Sedan');

console.log(`✅ Updated ${info.changes} Electric Sedan entries to use the new image.`);
