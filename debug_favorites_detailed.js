
import { db } from './server/database.js';

try {
    const brokenFavorites = db.prepare(`
        SELECT 
            f.id,
            f.item_type,
            f.item_id,
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN f.item_id
            END as resolved_title,
            CASE 
                WHEN f.item_type = 'Package' THEN (SELECT image_url FROM packages WHERE id = f.item_id)
                WHEN f.item_type = 'Hotel' THEN (SELECT image FROM hotels WHERE id = f.item_id)
                WHEN f.item_type = 'Taxi' THEN (SELECT image FROM taxis WHERE id = f.item_id)
                WHEN f.item_type = 'Destination' THEN (SELECT image_url FROM destinations WHERE destination_name = f.item_id)
            END as resolved_image
        FROM favorites f
    `).all();

    console.log(JSON.stringify(brokenFavorites, null, 2));

} catch (err) {
    console.error('Error debugging favorites:', err);
}
