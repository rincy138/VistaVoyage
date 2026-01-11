import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const row = db.prepare('SELECT title, image_url FROM packages WHERE title = ?').get('Thekkady');
console.log('Thekkady in packages:', row);

const destRow = db.prepare('SELECT destination_name, image_url FROM destinations WHERE destination_name = ?').get('Thekkady');
console.log('Thekkady in destinations:', destRow);

const all = db.prepare('SELECT count(*) as count FROM packages').get();
console.log('Total packages:', all.count);

const allDests = db.prepare('SELECT count(*) as count FROM destinations').get();
console.log('Total destinations:', allDests.count);

const missingImages = db.prepare('SELECT count(*) as count FROM packages WHERE image_url IS NULL OR image_url = ""').get();
console.log('Packages missing images:', missingImages.count);

const missingImagesDests = db.prepare('SELECT count(*) as count FROM destinations WHERE image_url IS NULL OR image_url = ""').get();
console.log('Destinations missing images:', missingImagesDests.count);

const somePkgs = db.prepare('SELECT id, title, image_url FROM packages LIMIT 5').all();
console.log('First 5 packages:', somePkgs);
