import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const packages = db.prepare('SELECT title, safety_score, crowd_level, eco_score, mood_tags FROM packages LIMIT 10 OFFSET 20').all();
console.log('Sample dynamic packages (Smart Features):');
console.table(packages);

const first = db.prepare('SELECT * FROM packages WHERE id = 1').get();
console.log('First package details (Munnar?):');
console.log(JSON.stringify(first, null, 2));
