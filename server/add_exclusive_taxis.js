
import { db } from './database.js';

console.log("Adding Exclusive Package Taxis...");

// Updated schema to include 'is_package_exclusive' column if it doesn't exist
try {
    const tableInfo = db.prepare("PRAGMA table_info(taxis)").all();
    const hasExclusiveCol = tableInfo.some(col => col.name === 'is_package_exclusive');

    if (!hasExclusiveCol) {
        console.log("Adding 'is_package_exclusive' column to taxis table...");
        db.prepare("ALTER TABLE taxis ADD COLUMN is_package_exclusive BOOLEAN DEFAULT 0").run();
    }
} catch (error) {
    console.error("Error altering table:", error.message);
}

const exclusiveTaxis = [
    {
        city: "Munnar",
        type: "Premium SUV",
        price_per_km: 0, // Included
        capacity: 6,
        rating: 4.9,
        features: JSON.stringify(["Panoramic Sunroof", "Reclining Seats", "WiFi Onboard", "English Speaking Driver"]),
        image: "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?q=80&w=2000",
        is_package_exclusive: 1
    },
    {
        city: "Wayanad",
        type: "Safari Jeep",
        price_per_km: 0,
        capacity: 5,
        rating: 4.8,
        features: JSON.stringify(["4x4 Offroad Capable", "Open Top", "Binoculars", "First Aid Kit"]),
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000",
        is_package_exclusive: 1
    },
    {
        city: "Alleppey",
        type: "Luxury Sedan",
        price_per_km: 0,
        capacity: 4,
        rating: 4.9,
        features: JSON.stringify(["Leather Interiors", "Climate Control", "Refreshments", "Extra Legroom"]),
        image: "https://images.unsplash.com/photo-1550355403-51975078382d?q=80&w=2000",
        is_package_exclusive: 1
    },
    {
        city: "Thekkady",
        type: "Forest Cruiser",
        price_per_km: 0,
        capacity: 7,
        rating: 4.7,
        features: JSON.stringify(["Jungle Ready", "Spotlights", "High Ground Clearance", "Experienced Guide"]),
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2000",
        is_package_exclusive: 1
    }
];

const insertTaxi = db.prepare(`
    INSERT INTO taxis (city, type, price_per_km, capacity, rating, features, image, is_package_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
    // Optional: clear existing *exclusive* taxis to prevent duplicates
    db.prepare("DELETE FROM taxis WHERE is_package_exclusive = 1").run();

    for (const t of exclusiveTaxis) {
        insertTaxi.run(t.city, t.type, t.price_per_km, t.capacity, t.rating, t.features, t.image, t.is_package_exclusive);
    }
})();

console.log(`Added ${exclusiveTaxis.length} exclusive package taxis successfully!`);
