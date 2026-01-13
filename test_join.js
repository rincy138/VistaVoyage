import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Testing JOIN with TEXT item_id...');

try {
    // 1. Get a valid package ID
    const pkg = db.prepare('SELECT id, title FROM packages LIMIT 1').get();
    if (!pkg) throw new Error('No packages found');
    console.log('Using Package ID:', pkg.id, 'Title:', pkg.title);

    // 2. Insert into favorites as TEXT
    db.prepare("DELETE FROM favorites WHERE item_id = ? AND item_type = 'Package'").run(String(pkg.id));
    db.prepare('INSERT INTO favorites (user_id, item_id, item_type) VALUES (?, ?, ?)').run(1, String(pkg.id), 'Package');

    // 3. Test the JOIN
    const fav = db.prepare(`
        SELECT f.*, 
        (SELECT title FROM packages WHERE id = f.item_id) as title
        FROM favorites f
        WHERE f.item_id = ? AND f.item_type = 'Package'
    `).get(String(pkg.id));

    console.log('Favorite Item ID:', fav.item_id);
    console.log('Joined Title:', fav.title);

    if (fav.title === pkg.title) {
        console.log('SUCCESS: JOIN worked with TEXT matching INTEGER id');
    } else {
        console.log('FAILURE: JOIN failed to match TEXT item_id to INTEGER id');
        // Let's try explicit CAST
        const fav2 = db.prepare(`
            SELECT (SELECT title FROM packages WHERE id = CAST(f.item_id AS INTEGER)) as title
            FROM favorites f
            WHERE f.item_id = ? AND f.item_type = 'Package'
        `).get(String(pkg.id));
        console.log('Joined Title with CAST:', fav2.title);
    }

} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
