import Database from 'better-sqlite3';

const db = new Database('./server/data/vistavoyage.db');
const row = db.prepare('SELECT * FROM packages WHERE id = ?').get(71);

console.log(row ? `Price: ${row.price} (${typeof row.price}), Duration: ${row.duration}` : 'Not Found');
