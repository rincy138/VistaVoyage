import Database from 'better-sqlite3';
import fs from 'fs';

const db = new Database('server/data/vistavoyage.db');
const festivals = db.prepare('SELECT name, image_url, description FROM festivals').all();

let output = '';
festivals.forEach(f => {
    output += `Name: ${f.name}\nURL:  ${f.image_url}\nDesc: ${f.description}\n-------------------------\n`;
});

fs.writeFileSync('server/db_dump.txt', output);
console.log('Dumped to server/db_dump.txt');
db.close();
