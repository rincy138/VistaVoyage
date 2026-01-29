import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const brokenUrl = 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2000';
const workingUrl = 'https://images.unsplash.com/photo-1549194388-f61be84a6e9e?q=80&w=2000';

const result = db.prepare('UPDATE taxis SET image = ? WHERE image = ?').run(workingUrl, brokenUrl);
console.log(`Fixed ${result.changes} taxi images.`);

const result2 = db.prepare("UPDATE taxis SET image = 'https://images.unsplash.com/photo-1550355403-51975078382d?q=80&w=2000' WHERE image LIKE '%photo-1503376763036%'").run();
console.log(`Fixed ${result2.changes} more taxi images.`);
