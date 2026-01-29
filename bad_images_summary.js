
import { db } from './server/database.js';

const tables = [
    { name: 'destinations', col: 'image_url' },
    { name: 'hotels', col: 'image' },
    { name: 'taxis', col: 'image' },
    { name: 'packages', col: 'image_url' }
];

tables.forEach(t => {
    const bad = db.prepare(`SELECT COUNT(*) as count FROM ${t.name} WHERE ${t.col} IS NULL OR ${t.col} = '' OR ${t.col} LIKE '/%' OR ${t.col} NOT LIKE 'http%'`).get().count;
    console.log(`${t.name}: ${bad} bad images`);
});
