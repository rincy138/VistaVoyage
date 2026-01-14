
import { db } from './server/database.js';

try {
    const tableInfo = db.pragma('table_info(users)');
    console.log('Users table columns:', tableInfo.map(c => c.name));

    // Check if we can select all columns for the first user
    const firstUser = db.prepare('SELECT * FROM users LIMIT 1').get();
    console.log('First user sample:', firstUser);

} catch (err) {
    console.error('Error checking schema:', err);
}
