
import sqlite3 from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const db = new sqlite3('server/data/vistavoyage.db');

async function resetAdmin() {
    const email = 'traveladmin@gmail.com';
    const newPassword = 'admin123';

    console.log(`Resetting password for ${email} to ${newPassword}...`);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const result = db.prepare('UPDATE users SET password = ? WHERE email = ? AND role = ?').run(hashedPassword, email, 'Admin');

    if (result.changes > 0) {
        console.log('✅ Success! Admin password updated to: admin123');
    } else {
        console.log('❌ Failed: User not found or not an admin.');
    }
}

resetAdmin().catch(console.error);
