
import { db } from './server/database.js';

try {
    console.log('Starting DB fix...');

    // 1. Fix Alleppey image
    console.log('Fixing Alleppey image...');
    const result = db.prepare(`
        UPDATE destinations 
        SET image_url = '/alleppey.png' 
        WHERE destination_name = 'Alleppey' AND (image_url IS NULL OR image_url = '')
    `).run();
    console.log(`Updated Alleppey image: ${result.changes} changes`);

    // 2. Remove broken favorites (orphaned items)
    console.log('Cleaning up broken favorites...');
    const deleteResult = db.prepare(`
        DELETE FROM favorites 
        WHERE 
            (item_type = 'Package' AND item_id NOT IN (SELECT id FROM packages)) OR
            (item_type = 'Hotel' AND item_id NOT IN (SELECT id FROM hotels)) OR
            (item_type = 'Taxi' AND item_id NOT IN (SELECT id FROM taxis)) OR
            (item_type = 'Destination' AND item_id NOT IN (SELECT destination_name FROM destinations))
    `).run();
    console.log(`Removed ${deleteResult.changes} broken favorites.`);

    console.log('DB fix completed.');

} catch (err) {
    console.error('Error fixing DB:', err);
}
