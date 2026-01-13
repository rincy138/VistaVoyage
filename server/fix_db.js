import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'data', 'vistavoyage.db'));

console.log('Fixing database constraints for favorites and reviews...');

try {
    // We cannot easily change constraints in SQLite.
    // The safest way is to recreate the tables with the new schema.

    // 1. Rename existing tables
    db.prepare('ALTER TABLE favorites RENAME TO favorites_old').run();
    db.prepare('ALTER TABLE reviews RENAME TO reviews_old').run();

    // 2. Create new tables with correct schema
    db.prepare(`
        CREATE TABLE favorites (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          item_id TEXT NOT NULL,
          item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi', 'Destination')) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `).run();

    db.prepare(`
        CREATE TABLE reviews (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          item_id TEXT NOT NULL,
          item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi', 'Destination')) NOT NULL,
          rating INTEGER CHECK(rating >= 1 AND rating <= 5),
          review TEXT,
          review_date DATE DEFAULT CURRENT_DATE,
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        )
    `).run();

    // 3. Copy data back
    try {
        db.prepare('INSERT INTO favorites (id, user_id, item_id, item_type, created_at) SELECT id, user_id, CAST(item_id AS TEXT), item_type, created_at FROM favorites_old').run();
        console.log('Successfully migrated favorites data.');
    } catch (e) {
        console.log('Could not migrate old favorites data (possibly empty or incompatible).');
    }

    try {
        db.prepare('INSERT INTO reviews (id, user_id, item_id, item_type, rating, review, review_date) SELECT id, user_id, CAST(item_id AS TEXT), item_type, rating, review, review_date FROM reviews_old').run();
        console.log('Successfully migrated reviews data.');
    } catch (e) {
        console.log('Could not migrate old reviews data (possibly empty or incompatible).');
    }

    // 4. Drop old tables
    db.prepare('DROP TABLE favorites_old').run();
    db.prepare('DROP TABLE reviews_old').run();

    console.log('Database fix complete!');
} catch (err) {
    console.error('Error during migration:', err.message);
} finally {
    db.close();
}
