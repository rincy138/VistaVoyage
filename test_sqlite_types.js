import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Testing SQLite type matching for item_id (TEXT)...');

try {
    // Clean up
    db.prepare("DELETE FROM favorites WHERE item_id IN ('99999', '88888')").run();

    // Insert as integer
    console.log('Inserting with integer 99999...');
    db.prepare('INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)').run(1, 99999, 'Package');

    const res1 = db.prepare('SELECT * FROM favorites WHERE item_id = ? AND item_type = ?').get(99999, 'Package');
    console.log('Query with integer 99999:', res1 ? 'FOUND' : 'NOT FOUND');

    const res2 = db.prepare('SELECT * FROM favorites WHERE item_id = ? AND item_type = ?').get('99999', 'Package');
    console.log('Query with string "99999":', res2 ? 'FOUND' : 'NOT FOUND');

    const row = db.prepare("SELECT item_id, typeof(item_id) as type FROM favorites WHERE item_id = '99999'").get();
    if (row) {
        console.log('Stored value:', row.item_id, 'Stored type:', row.type);
    }

    // Insert as string
    console.log('\nInserting with string "88888"...');
    db.prepare('INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)').run(1, '88888', 'Package');

    const res3 = db.prepare('SELECT * FROM favorites WHERE item_id = ? AND item_type = ?').get(88888, 'Package');
    console.log('Query with integer 88888:', res3 ? 'FOUND' : 'NOT FOUND');

    const res4 = db.prepare('SELECT * FROM favorites WHERE item_id = ? AND item_type = ?').get('88888', 'Package');
    console.log('Query with string "88888":', res4 ? 'FOUND' : 'NOT FOUND');

} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.prepare("DELETE FROM favorites WHERE item_id IN ('99999', '88888')").run();
    db.close();
}
