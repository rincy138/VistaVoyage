
import { db } from './server/database.js';

try {
    const favorites = db.prepare('SELECT * FROM favorites').all();
    console.log('Favorites:', favorites);

    const packages = db.prepare('SELECT id, title, image_url FROM packages').all();
    console.log('Packages (first 5):', packages.slice(0, 5));

    const enrichedFavorites = db.prepare(`
        SELECT f.*, 
        CASE 
            WHEN f.item_type = 'Package' THEN (SELECT title FROM packages WHERE id = f.item_id)
            WHEN f.item_type = 'Hotel' THEN (SELECT name FROM hotels WHERE id = f.item_id)
            WHEN f.item_type = 'Taxi' THEN (SELECT type FROM taxis WHERE id = f.item_id)
            WHEN f.item_type = 'Destination' THEN f.item_id
        END as title,
        CASE 
            WHEN f.item_type = 'Package' THEN (SELECT image_url FROM packages WHERE id = f.item_id)
            WHEN f.item_type = 'Hotel' THEN (SELECT image FROM hotels WHERE id = f.item_id)
            WHEN f.item_type = 'Taxi' THEN (SELECT image FROM taxis WHERE id = f.item_id)
            WHEN f.item_type = 'Destination' THEN (SELECT image_url FROM destinations WHERE destination_name = f.item_id)
        END as image
        FROM favorites f
    `).all();
    console.log('Enriched Favorites:', enrichedFavorites);

} catch (err) {
    console.error('Error debugging favorites:', err);
}
