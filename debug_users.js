import Database from 'better-sqlite3';

const db = new Database('server/data/vistavoyage.db', { verbose: console.log });

try {
    const users = db.prepare('SELECT user_id, name, email, role FROM users').all();
    console.log("Users:", JSON.stringify(users, null, 2));
} catch (err) {
    console.error("Error reading users:", err);
}
