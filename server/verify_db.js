import { db } from './database.js';

const rows = db.prepare('SELECT * FROM packages').all();
console.log('Packages in DB:', rows.length);
if (rows.length > 0) {
    console.log('First package:', rows[0].title);
}
