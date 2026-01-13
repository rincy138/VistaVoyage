import Database from 'better-sqlite3';

const db = new Database('./server/data/vistavoyage.db');

console.log('=== TESTING FAVORITES QUERY ===');

// This is the exact query from the backend
const userId = 1; // Assuming user_id 1
const favorites = db.prepare(`
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
    WHERE f.user_id = ?
`).all(userId);

console.log('Favorites found:', favorites.length);
console.log(JSON.stringify(favorites, null, 2));

db.close();
