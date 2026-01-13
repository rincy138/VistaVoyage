import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Adding more hotels for Munnar...');

const munnarHotels = [
    {
        name: "The Panoramic Getaway",
        location: "Chithirapuram, Munnar",
        city: "Munnar",
        type: "Mountain",
        rating: 4.8,
        price: 12500,
        image: "https://images.unsplash.com/photo-1571896349842-6e53ce41e887?q=80&w=1000",
        amenities: ["Rooftop Pool", "Helipad", "Spa", "Mountain View"]
    },
    {
        name: "Amber Dale Luxury Hotel",
        location: "Pallivasal, Munnar",
        city: "Munnar",
        type: "Valley",
        rating: 4.7,
        price: 9800,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
        amenities: ["Valley View", "Ayurveda Spa", "Game Room"]
    },
    {
        name: "Scenic Munnar - IHCL SeleQtions",
        location: "Chithirapuram, Munnar",
        city: "Munnar",
        type: "Luxury",
        rating: 4.9,
        price: 15000,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
        amenities: ["Pool", "Fitness Center", "Multi-cuisine Restaurant"]
    },
    {
        name: "Fragrant Nature Munnar",
        location: "Pothamedu, Munnar",
        city: "Munnar",
        type: "Colonial",
        rating: 4.8,
        price: 11200,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
        amenities: ["Fireplace Rooms", "Amphitheatre", "Spa"]
    },
    {
        name: "Ragamaya Resort & Spa",
        location: "Rajakkad, Munnar",
        city: "Munnar",
        type: "Resort",
        rating: 4.6,
        price: 8500,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000",
        amenities: ["Infinity Pool", "Lake View", "Fishing"]
    },
    {
        name: "Parakkat Nature Resorts",
        location: "Pallivasal, Munnar",
        city: "Munnar",
        type: "Mountain",
        rating: 4.5,
        price: 9200,
        image: "https://images.unsplash.com/photo-1445019980597-93fa8acb726c?q=80&w=1000",
        amenities: ["Coffee Shop", "Villa Suites", "Trekking"]
    },
    {
        name: "Elixir Hills",
        location: "Mankulam, Munnar",
        city: "Munnar",
        type: "Rainforest",
        rating: 4.7,
        price: 10500,
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000",
        amenities: ["Waterfall Trek", "Infinity Pool", "Forest Stay"]
    },
    {
        name: "The Leaf Munnar",
        location: "Anachal, Munnar",
        city: "Munnar",
        type: "Nature",
        rating: 4.4,
        price: 7500,
        image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000",
        amenities: ["Cottages", "Organic Garden", "Pool"]
    },
    {
        name: "Mountain Club Resort",
        location: "Chinnakanal, Munnar",
        city: "Munnar",
        type: "Heritage",
        rating: 4.5,
        price: 8800,
        image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1000",
        amenities: ["Stone Cottages", "Ayurveda", "Campfire"]
    }
];

const insertStmt = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkStmt = db.prepare('SELECT 1 FROM hotels WHERE name = ?');

let addedCount = 0;

db.transaction(() => {
    munnarHotels.forEach(hotel => {
        const exists = checkStmt.get(hotel.name);
        if (!exists) {
            insertStmt.run(
                hotel.name,
                hotel.location,
                hotel.city,
                hotel.type,
                hotel.rating,
                hotel.price,
                hotel.image,
                JSON.stringify(hotel.amenities)
            );
            console.log(`✅ Added: ${hotel.name}`);
            addedCount++;
        } else {
            console.log(`ℹ️ Skipped (already exists): ${hotel.name}`);
        }
    });
})();

console.log(`Done! Added ${addedCount} new hotels for Munnar.`);
