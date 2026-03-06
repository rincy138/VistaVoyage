import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');
const schema = db.prepare("SELECT sql FROM sqlite_master WHERE name='festivals'").get();
console.log(schema.sql);
db.close();
