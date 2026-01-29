
import { db } from './server/database.js';

console.log('--- Searching for Local/Missing Images ---');

const checkTable = (table, col) => {
    const records = db.prepare(`SELECT * FROM ${table} WHERE ${col} IS NULL OR ${col} = '' OR ${col} LIKE '/%' OR ${col} NOT LIKE 'http%'`).all();
    console.log(`${table}: Found ${records.length} records with non-URL images`);
    if (records.length > 0) {
        console.log(`Sample missing for ${table}:`, records.slice(0, 3).map(r => ({ id: r.id || r.destination_id, name: r.name || r.title || r.destination_name, img: r[col] })));
    }
    return records;
};

checkTable('destinations', 'image_url');
checkTable('hotels', 'image');
checkTable('taxis', 'image');
checkTable('packages', 'image_url');
