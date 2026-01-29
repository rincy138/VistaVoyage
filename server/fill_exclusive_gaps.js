
import { db } from './database.js';

console.log("Filling gaps for Exclusive Hotels & Taxis...");

// 1. Get cities
const packages = db.prepare("SELECT DISTINCT destination FROM packages").all();
const cities = [...new Set(packages.map(p => p.destination.split(',')[0].trim()))];

// 2. Prepare statements
const insertHotel = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities, is_package_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertTaxi = db.prepare(`
    INSERT INTO taxis (city, type, price_per_km, capacity, rating, features, image, is_package_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
`);

// 3. Image pools (generic nice travel images)
const genericHotelImages = [
    "https://images.unsplash.com/photo-1571896349842-7669d355ce24?q=80&w=2000",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000"
];

const citySpecificImages = {
    "Coimbatore": [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000", // City hotel vibe
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000"
    ],
    "Pune": [
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2000"
    ]
};

const getHotelImage = (city) => {
    if (citySpecificImages[city]) {
        return citySpecificImages[city][Math.floor(Math.random() * citySpecificImages[city].length)];
    }
    return genericHotelImages[Math.floor(Math.random() * genericHotelImages.length)];
};

const taxiImages = [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2000",
    "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?q=80&w=2000",
    "https://images.unsplash.com/photo-1550355403-51975078382d?q=80&w=2000"
];

// 4. Iterate and Fill
db.transaction(() => {
    let hotelsAdded = 0;
    let taxisAdded = 0;

    cities.forEach(city => {
        // CHECK HOTEL
        const hasHotel = db.prepare("SELECT 1 FROM hotels WHERE city = ? AND is_package_exclusive = 1").get(city);
        if (!hasHotel) {
            insertHotel.run(
                `${city} Premium Suites`,
                `Prime Location, ${city}`,
                city,
                "Exclusive Hotel",
                4.8,
                0, // Included
                getHotelImage(city),
                JSON.stringify(["Welcome Drink", "Free Breakfast", "City View", "Luxury Spa"])
            );
            insertHotel.run(
                `${city} Grand Residency`,
                `City Center, ${city}`,
                city,
                "Luxury Stay",
                4.7,
                0,
                getHotelImage(city),
                JSON.stringify(["Rooftop Pool", "Fine Dining", "Gym", "Concierge"])
            );
            hotelsAdded += 2;
        }

        // CHECK TAXI
        const hasTaxi = db.prepare("SELECT 1 FROM taxis WHERE city = ? AND is_package_exclusive = 1").get(city);
        if (!hasTaxi) {
            insertTaxi.run(
                city,
                "Premium Sedan",
                0,
                4,
                4.8,
                JSON.stringify(["AC", "WiFi", "Water Bottles", "Professional Driver"]),
                taxiImages[Math.floor(Math.random() * taxiImages.length)]
            );
            insertTaxi.run(
                city,
                "Luxury SUV",
                0,
                6,
                4.9,
                JSON.stringify(["Extra Legroom", "Sunroof", "Reclining Seats", "Premium Sound"]),
                taxiImages[Math.floor(Math.random() * taxiImages.length)]
            );
            taxisAdded += 2;
        }
    });

    console.log(`Job Done: Added ${hotelsAdded} hotels and ${taxisAdded} taxis.`);
})();
