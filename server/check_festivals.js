import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');
const rows = db.prepare('SELECT name, image_url FROM festivals').all();
console.log(JSON.stringify(rows, null, 2));
db.close();
