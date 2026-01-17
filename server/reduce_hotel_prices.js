import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Reducing hotel prices to more affordable ranges...\n');

try {
    // Get all hotels
    const hotels = db.prepare('SELECT id, name, price FROM hotels').all();

    console.log(`Found ${hotels.length} hotels. Updating prices...\n`);

    const updateStmt = db.prepare('UPDATE hotels SET price = ? WHERE id = ?');

    let updated = 0;
    hotels.forEach(hotel => {
        // Reduce prices to 20-30% of original (more affordable)
        // This will bring prices from ₹10,500-₹72,000 down to ₹2,100-₹21,600
        // Then we'll cap at ₹8,000 for luxury hotels
        let newPrice = Math.round(hotel.price * 0.25);

        // Set reasonable price ranges
        if (newPrice > 8000) newPrice = Math.floor(Math.random() * (8000 - 6000) + 6000); // Luxury: ₹6,000-₹8,000
        else if (newPrice > 5000) newPrice = Math.floor(Math.random() * (5500 - 4000) + 4000); // Premium: ₹4,000-₹5,500
        else if (newPrice > 3000) newPrice = Math.floor(Math.random() * (4000 - 2500) + 2500); // Mid-range: ₹2,500-₹4,000
        else newPrice = Math.floor(Math.random() * (3000 - 1500) + 1500); // Budget: ₹1,500-₹3,000

        updateStmt.run(newPrice, hotel.id);
        console.log(`✓ ${hotel.name}: ₹${hotel.price.toLocaleString()} → ₹${newPrice.toLocaleString()}`);
        updated++;
    });

    console.log(`\n✅ Successfully updated ${updated} hotel prices!`);

    // Show sample of new prices
    const samples = db.prepare('SELECT name, city, price FROM hotels LIMIT 10').all();
    console.log('\nSample of updated prices:');
    samples.forEach(h => {
        console.log(`  ${h.name} (${h.city}): ₹${h.price.toLocaleString()}/night`);
    });

} catch (err) {
    console.error('Error updating prices:', err);
} finally {
    db.close();
}
