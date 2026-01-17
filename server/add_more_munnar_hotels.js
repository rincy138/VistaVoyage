import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

const munnarHotels = [
    {
        name: "The Panoramic Getaway",
        location: "Pothamedu, Munnar",
        city: "Munnar",
        type: "Resort",
        rating: 4.8,
        price: 8500,
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d",
        amenities: ["Mountain View", "Tea Garden Tours", "Bonfire", "Free WiFi"]
    },
    {
        name: "Spice Tree Munnar",
        location: "Anachal, Munnar",
        city: "Munnar",
        type: "Boutique Hotel",
        rating: 4.7,
        price: 7200,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        amenities: ["Spice Plantation", "Ayurvedic Spa", "Organic Food", "Nature Walks"]
    },
    {
        name: "Misty Mountain Resort",
        location: "Chithirapuram, Munnar",
        city: "Munnar",
        type: "Mountain Resort",
        rating: 4.9,
        price: 12000,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
        amenities: ["Valley View", "Indoor Games", "Campfire", "Restaurant"]
    },
    {
        name: "Tea County Resort",
        location: "Bison Valley Road, Munnar",
        city: "Munnar",
        type: "Heritage Resort",
        rating: 4.6,
        price: 9800,
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
        amenities: ["Tea Estate View", "Swimming Pool", "Trekking", "Multi-Cuisine Restaurant"]
    },
    {
        name: "Windermere Estate",
        location: "Pothamedu, Munnar",
        city: "Munnar",
        type: "Plantation Stay",
        rating: 4.8,
        price: 11500,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
        amenities: ["Tea Plantation", "Colonial Architecture", "Library", "Garden"]
    },
    {
        name: "Mountain Club Resort",
        location: "Kannan Devan Hills, Munnar",
        city: "Munnar",
        type: "Mountain",
        rating: 4.5,
        price: 6800,
        image: "https://images.unsplash.com/photo-1596436889106-be35e843f974",
        amenities: ["Panoramic Views", "Adventure Activities", "Outdoor Pool", "Spa"]
    },
    {
        name: "The Fog Resort & Spa",
        location: "Pallivasal, Munnar",
        city: "Munnar",
        type: "Luxury Resort",
        rating: 4.9,
        price: 15000,
        image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7",
        amenities: ["Infinity Pool", "Spa & Wellness", "Fine Dining", "Yoga Sessions"]
    },
    {
        name: "Green Woods Resort",
        location: "Chinnakanal, Munnar",
        city: "Munnar",
        type: "Eco Resort",
        rating: 4.4,
        price: 5500,
        image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c",
        amenities: ["Eco-Friendly", "Bird Watching", "Organic Garden", "Campfire"]
    },
    {
        name: "Sienna Village",
        location: "Anachal Road, Munnar",
        city: "Munnar",
        type: "Cottage Resort",
        rating: 4.7,
        price: 8900,
        image: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904",
        amenities: ["Private Cottages", "Bonfire", "Indoor Games", "Restaurant"]
    },
    {
        name: "Sterling Munnar",
        location: "Anachal, Munnar",
        city: "Munnar",
        type: "Resort",
        rating: 4.6,
        price: 10200,
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461",
        amenities: ["Kids Play Area", "Multi-Cuisine", "Indoor Pool", "Activity Center"]
    }
];

const hotelInsert = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

console.log('Adding more hotels to Munnar...');

munnarHotels.forEach(hotel => {
    try {
        hotelInsert.run(
            hotel.name,
            hotel.location,
            hotel.city,
            hotel.type,
            hotel.rating,
            hotel.price,
            hotel.image,
            JSON.stringify(hotel.amenities)
        );
        console.log(`✓ Added: ${hotel.name}`);
    } catch (err) {
        console.error(`✗ Error adding ${hotel.name}:`, err.message);
    }
});

const count = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE city = ?').get('Munnar');
console.log(`\nTotal hotels in Munnar: ${count.count}`);

db.close();
