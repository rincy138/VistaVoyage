
import { db } from './server/database.js';

console.log('--- Sample Images ---');
console.log('Packages:', db.prepare('SELECT title, image_url FROM packages LIMIT 3').all());
console.log('Hotels:', db.prepare('SELECT name, image FROM hotels LIMIT 3').all());
console.log('Taxis:', db.prepare('SELECT type, image FROM taxis LIMIT 3').all());
console.log('Destinations:', db.prepare('SELECT destination_name, image_url FROM destinations LIMIT 3').all());
