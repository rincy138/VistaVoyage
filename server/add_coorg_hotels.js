import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Adding more hotels for Coorg...');

const coorgHotels = [
    {
        name: "Taj Madikeri Resort & Spa",
        location: "Madikeri, Coorg",
        city: "Coorg",
        type: "Rainforest",
        rating: 4.8,
        price: 25000,
        image: "https://images.unsplash.com/photo-1571896349842-6e53ce41e887?q=80&w=1000",
        amenities: ["Rainforest View", "Jiva Spa", "Indoor Pool"]
    },
    {
        name: "The Tamara Coorg",
        location: "Kabbinakad, Coorg",
        city: "Coorg",
        type: "Mountain",
        rating: 4.9,
        price: 22000,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000",
        amenities: ["Coffee Plantation", "Yoga Deck", "Trekking"]
    },
    {
        name: "The IBNII - Eco Luxury Resort",
        location: "Ibnivalvadi, Coorg",
        city: "Coorg",
        type: "Eco",
        rating: 4.7,
        price: 18500,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
        amenities: ["Private Pool", "Nature Walk", "Spa"]
    },
    {
        name: "Coorg Wilderness Resort",
        location: "Virajpet, Coorg",
        city: "Coorg",
        type: "Wilderness",
        rating: 4.8,
        price: 21000,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
        amenities: ["Infinity Pool", "Sunset Point", "Adventure Sports"]
    },
    {
        name: "Evolve Back Coorg",
        location: "Siddapur, Coorg",
        city: "Coorg",
        type: "Plantation",
        rating: 4.9,
        price: 32000,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
        amenities: ["Private Pool Villas", "Ayurveda", "Bird Watching"]
    },
    {
        name: "Amanvana Spa Resort",
        location: "Kushalxagar, Coorg",
        city: "Coorg",
        type: "River",
        rating: 4.6,
        price: 14000,
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000",
        amenities: ["River View Bungalows", "Spa", "Private Courtyard"]
    },
    {
        name: "Coorg Marriott Resort",
        location: "Madikeri, Coorg",
        city: "Coorg",
        type: "Luxury",
        rating: 4.7,
        price: 24000,
        image: "https://images.unsplash.com/photo-1551882547-ff43c61fe9b7?q=80&w=1000",
        amenities: ["Pool", "Kids Club", "Forest View"]
    },
    {
        name: "Club Mahindra Madikeri",
        location: "Galibeedu, Coorg",
        city: "Coorg",
        type: "Resort",
        rating: 4.5,
        price: 12000,
        image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1000",
        amenities: ["Family Activities", "Adventure Valley", "Spa"]
    },
    {
        name: "Windflower Resort & Spa",
        location: "Suntikoppa, Coorg",
        city: "Coorg",
        type: "Wellness",
        rating: 4.6,
        price: 16500,
        image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000",
        amenities: ["Emetra Spa", "Hydrotherapy", "Plantation Tour"]
    }
];

const insertStmt = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkStmt = db.prepare('SELECT 1 FROM hotels WHERE name = ?');

let addedCount = 0;

db.transaction(() => {
    coorgHotels.forEach(hotel => {
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

console.log(`Done! Added ${addedCount} new hotels for Coorg.`);
