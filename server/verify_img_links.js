import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');
const rows = db.prepare('SELECT name, image_url FROM festivals').all();
rows.forEach(row => {
    console.log(`Name: ${row.name}`);
    console.log(`URL:  ${row.image_url}`);
    console.log('---');
});
db.close();
