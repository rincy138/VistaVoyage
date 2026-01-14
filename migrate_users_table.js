
import { db } from './server/database.js';

try {
    const tableInfo = db.pragma('table_info(users)');
    const columns = tableInfo.map(c => c.name);

    if (!columns.includes('bio')) {
        console.log('Adding bio column...');
        db.prepare('ALTER TABLE users ADD COLUMN bio TEXT').run();
    } else {
        console.log('bio column already exists.');
    }

    if (!columns.includes('profile_picture')) {
        console.log('Adding profile_picture column...');
        db.prepare('ALTER TABLE users ADD COLUMN profile_picture TEXT').run();
    } else {
        console.log('profile_picture column already exists.');
    }

    console.log('Migration completed successfully.');
} catch (err) {
    console.error('Migration failed:', err);
}
