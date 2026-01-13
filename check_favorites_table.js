import Database from 'better-sqlite3';

const db = new Database('./server/data/vistavoyage.db');

console.log('=== FAVORITES TABLE SCHEMA ===');
const schema = db.prepare('PRAGMA table_info(favorites)').all();
console.log(schema);

console.log('\n=== SAMPLE FAVORITES ===');
const favorites = db.prepare('SELECT * FROM favorites LIMIT 5').all();
console.log(favorites);

console.log('\n=== TOTAL FAVORITES COUNT ===');
const count = db.prepare('SELECT COUNT(*) as count FROM favorites').get();
console.log(count);

db.close();
