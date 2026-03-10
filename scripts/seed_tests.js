import sqlite from 'better-sqlite3';
import bcrypt from 'bcryptjs';
const db = new sqlite('./server/data/vistavoyage.db');

async function seed() {
    const hashedPassword = await bcrypt.hash('Password123', 10);

    // Check if tester exists
    const tester = db.prepare('SELECT user_id FROM users WHERE email = ?').get('tester@example.com');
    if (!tester) {
        db.prepare(`
            INSERT INTO users (name, email, password, role) 
            VALUES (?, ?, ?, ?)
        `).run('Test User', 'tester@example.com', hashedPassword, 'Traveler');
        console.log("Seeded tester@example.com");
    } else {
        db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, 'tester@example.com');
        console.log("Updated tester@example.com password");
    }

    // Check if agent exists
    const agent = db.prepare('SELECT user_id FROM users WHERE email = ?').get('agent@gmail.com');
    if (!agent) {
        db.prepare(`
            INSERT INTO users (name, email, password, role) 
            VALUES (?, ?, ?, ?)
        `).run('Agent User', 'agent@gmail.com', hashedPassword, 'Agent');
        console.log("Seeded agent@gmail.com");
    } else {
        db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, 'agent@gmail.com');
        console.log("Updated agent@gmail.com password");
    }
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
