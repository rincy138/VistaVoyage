import Database from 'better-sqlite3';

const db = new Database('server/data/vistavoyage.db');

const festivals = db.prepare('SELECT id, name, image_url FROM festivals').all();

console.log('Cleaning festival URLs...');

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE id = ?');

db.transaction(() => {
    for (const f of festivals) {
        if (f.image_url) {
            const cleanUrl = f.image_url.trim();
            stmt.run(cleanUrl, f.id);
            console.log(`Cleaned ${f.name}`);
        }
    }
})();

console.log('Done.');
db.close();
