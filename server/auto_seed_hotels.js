import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');

const db = new Database(dbPath);

console.log('Generating and adding hotels for remaining destinations...');

const hotelTemplates = {
    'Mountain': [
        { suffix: 'Hill Resort', type: 'Mountain', price: 12000, amenities: ['Mountain View', 'Bonfire', 'Trekking'] },
        { suffix: 'Valley View Hotel', type: 'Valley', price: 9500, amenities: ['Valley View', 'Restaurant', 'Garden'] },
        { suffix: 'Pine Retreat', type: 'Nature', price: 11000, amenities: ['Forest Walk', 'Wooden Cottages'] }
    ],
    'Beach': [
        { suffix: 'Beach Resort', type: 'Beach', price: 18000, amenities: ['Private Beach', 'Pool', 'Seafood'] },
        { suffix: 'Sea View Hotel', type: 'Sea View', price: 14000, amenities: ['Ocean View', 'Balcony', 'Bar'] },
        { suffix: 'Sands Inn', type: 'Budget Beach', price: 8000, amenities: ['Beach Access', 'Restaurant'] }
    ],
    'Heritage': [
        { suffix: 'Heritage Haveli', type: 'Heritage', price: 22000, amenities: ['Royal Decor', 'Folk Music', 'Pool'] },
        { suffix: 'Palace Hotel', type: 'Palace', price: 35000, amenities: ['Luxury Suites', 'Spa', 'Fine Dining'] },
        { suffix: 'Historic Stay', type: 'Classic', price: 13000, amenities: ['Vintage Rooms', 'City Tour'] }
    ],
    'City': [
        { suffix: 'Grand Hotel', type: 'Luxury', price: 16000, amenities: ['City View', 'Gym', 'Conference Room'] },
        { suffix: 'City Suites', type: 'Business', price: 9000, amenities: ['WiFi', 'Breakfast', 'Workspace'] },
        { suffix: 'Boutique Stay', type: 'Boutique', price: 11000, amenities: ['Unique Decor', 'Cafe'] }
    ],
    'Nature': [
        { suffix: 'Nature Camp', type: 'Camping', price: 6000, amenities: ['Tents', 'Bonfire', 'Stargazing'] },
        { suffix: 'Eco Lodge', type: 'Eco', price: 10000, amenities: ['Organic Food', 'Nature Walks'] },
        { suffix: 'Wilderness Resort', type: 'Wildlife', price: 15000, amenities: ['Safari', 'Pool', 'Cottages'] }
    ],
    'Spiritual': [
        { suffix: 'Residency', type: 'Pilgrim', price: 5000, amenities: ['Temple View', 'Veg Food'] },
        { suffix: 'Ashram Stay', type: 'Spiritual', price: 3000, amenities: ['Yoga', 'Meditation Hall'] },
        { suffix: 'Lotus Hotel', type: 'Budget', price: 7000, amenities: ['AC Rooms', 'Travel Desk'] }
    ]
};

// Map specific cities to types if possible, else default
const cityTypes = {
    'Munnar': 'Mountain', 'Wayanad': 'Mountain', 'Thekkady': 'Nature', 'Leh': 'Mountain', 'Manali': 'Mountain',
    'Goa': 'Beach', 'Andaman': 'Beach', 'Lakshadweep': 'Beach', 'Kovalam': 'Beach', 'Varkala': 'Beach',
    'Jaipur': 'Heritage', 'Udaipur': 'Heritage', 'Jodhpur': 'Heritage', 'Agra': 'Heritage', 'Varanasi': 'Spiritual',
    'Rishikesh': 'Spiritual', 'Tirupati': 'Spiritual', 'Madurai': 'Spiritual',
    'Delhi': 'City', 'Mumbai': 'City', 'Bengaluru': 'City', 'Kolkata': 'City', 'Chennai': 'City', 'Hyderabad': 'City'
};

const imageMap = {
    'Mountain': 'https://images.unsplash.com/photo-1571896349842-6e53ce41e887?q=80&w=1000',
    'Beach': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000',
    'Heritage': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
    'City': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
    'Nature': 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000',
    'Spiritual': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?q=80&w=1000',
    'Valley': 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    'Eco': 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000'
};

// Get all unique cities from destinations table or packages
const destinations = db.prepare('SELECT DISTINCT destination FROM packages').all();

const insertStmt = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkStmt = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE city = ?');

let details = [];

db.transaction(() => {
    destinations.forEach(dest => {
        // Extract main city name (e.g., "Munnar, Kerala" -> "Munnar")
        let cleanCity = dest.destination.split(',')[0].trim();
        if (cleanCity === 'Andaman Islands') cleanCity = 'Andaman';
        if (cleanCity === 'North Goa') cleanCity = 'Goa';

        // Check if hotels already exist for this city
        const existing = checkStmt.get(cleanCity);

        if (existing.count < 3) { // Only add if fewer than 3 hotels exist
            let type = 'Nature'; // Default
            if (cityTypes[cleanCity]) type = cityTypes[cleanCity];
            else if (cleanCity.includes('Beach')) type = 'Beach';
            else if (cleanCity.includes('Hill')) type = 'Mountain';

            // Pick templates for this type (fallback to Nature if type not found in templates)
            const templates = hotelTemplates[type] || hotelTemplates['Nature'];

            templates.forEach(tpl => {
                const name = `${cleanCity} ${tpl.suffix}`;
                const location = `${cleanCity} Center`;
                const img = imageMap[tpl.type] || imageMap['Nature'];

                insertStmt.run(
                    name, location, cleanCity, tpl.type,
                    (4 + Math.random()).toFixed(1), // Random rating 4.0-5.0
                    tpl.price, img, JSON.stringify(tpl.amenities)
                );
                details.push(name);
            });
        }
    });
})();

console.log(`Auto-generated and added ${details.length} hotels for missing locations.`);
