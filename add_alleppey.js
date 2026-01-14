
import { db } from './server/database.js';

try {
    const destCount = db.prepare('SELECT count(*) as count FROM destinations').get();
    console.log('Total destinations:', destCount.count);

    // Add Alleppey if missing
    const exists = db.prepare("SELECT 1 FROM destinations WHERE destination_name = 'Alleppey'").get();
    if (!exists) {
        console.log('Adding Alleppey...');
        db.prepare(`
            INSERT INTO destinations (destination_name, location, description, image_url)
            VALUES (?, ?, ?, ?)
        `).run(
            'Alleppey',
            'Kerala, India',
            'Known as the "Venice of the East", famous for its backwaters and houseboats.',
            '/alleppey.png'
        );
        console.log('Alleppey added.');
    } else {
        console.log('Alleppey already exists.');
    }

} catch (err) {
    console.error('Error:', err);
}
