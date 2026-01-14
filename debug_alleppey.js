
import { db } from './server/database.js';

try {
    const alleppey = db.prepare("SELECT * FROM destinations WHERE destination_name = 'Alleppey'").get();
    console.log('Alleppey row:', alleppey);
} catch (err) {
    console.error('Error:', err);
}
