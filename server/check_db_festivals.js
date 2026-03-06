import Database from 'better-sqlite3';

const db = new Database('server/data/vistavoyage.db');
const festivals = db.prepare('SELECT name, image_url, description FROM festivals').all();

console.log('--- Database Festivals ---');
festivals.forEach(f => {
    console.log(`Name: ${f.name}`);
    console.log(`URL:  ${f.image_url}`);
    console.log(`Desc: ${f.description}`);
    console.log('-------------------------');
});
db.close();
