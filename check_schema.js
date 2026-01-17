import Database from 'better-sqlite3';

const db = new Database('./server/data/vistavoyage.db');
const columns = db.pragma('table_info(packages)');
console.log(columns.map(c => c.name));
