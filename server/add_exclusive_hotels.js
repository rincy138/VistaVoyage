
import { db } from './database.js';

console.log("Adding Exclusive Package Hotels...");

// Updated schema to include 'is_package_exclusive' column if it doesn't exist
try {
    const tableInfo = db.prepare("PRAGMA table_info(hotels)").all();
    const hasExclusiveCol = tableInfo.some(col => col.name === 'is_package_exclusive');

    if (!hasExclusiveCol) {
        console.log("Adding 'is_package_exclusive' column to hotels table...");
        db.prepare("ALTER TABLE hotels ADD COLUMN is_package_exclusive BOOLEAN DEFAULT 0").run();
    }
} catch (error) {
    console.error("Error altering table:", error.message);
}

const exclusiveHotels = [
    {
        name: "Munnar Tea Hills Resort",
        location: "Chithirapuram, Munnar",
        city: "Munnar",
        type: "Resort",
        rating: 4.8,
        price: 0, // Price included in package
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000",
        amenities: JSON.stringify(["Tea Garden View", "Ayurvedic Spa", "Infinity Pool", "Guided Trekking"]),
        is_package_exclusive: 1
    },
    {
        name: "Cloud 9 Luxury Villas",
        location: "Pothamedu, Munnar",
        city: "Munnar",
        type: "Villa",
        rating: 4.9,
        price: 0,
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000",
        amenities: JSON.stringify(["Private Chef", "Cloud Walk", "Bonfire", "Jacuzzi"]),
        is_package_exclusive: 1
    },
    {
        name: "Wayanad Wild Rainforest Lodge",
        location: "Lakkidi, Wayanad",
        city: "Wayanad",
        type: "Jungle Lodge",
        rating: 4.7,
        price: 0,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000",
        amenities: JSON.stringify(["Canopy Walk", "Stream Side Dining", "Wildlife Spotting", "Eco Friendly"]),
        is_package_exclusive: 1
    },
    {
        name: "Thekkady Elephant Court",
        location: "Kumily, Thekkady",
        city: "Thekkady",
        type: "Heritage",
        rating: 4.6,
        price: 0,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000",
        amenities: JSON.stringify(["Elephant Safari", "Spice Plantation Tour", "Cultural Show", "Pool"]),
        is_package_exclusive: 1
    },
    {
        name: "Alleppey Backwater Palace",
        location: "Punnamada, Alleppey",
        city: "Alleppey",
        type: "Houseboat",
        rating: 4.9,
        price: 0,
        image: "https://images.unsplash.com/photo-1593693397690-362ae9666ec2?q=80&w=2000",
        amenities: JSON.stringify(["Private Deck", "Traditional Kerala Meals", "Sunset Cruise", "Fishing"]),
        is_package_exclusive: 1
    },
    {
        name: "Varkala Cliff Hanger",
        location: "North Cliff, Varkala",
        city: "Varkala",
        type: "Beach Resort",
        rating: 4.5,
        price: 0,
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000",
        amenities: JSON.stringify(["Ocean View Rooms", "Surfing Lessons", "Cliffside Cafe", "Yoga Deck"]),
        is_package_exclusive: 1
    }
];

const insertHotel = db.prepare(`
    INSERT INTO hotels (name, location, city, type, rating, price, image, amenities, is_package_exclusive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

db.transaction(() => {
    // Optional: clear existing *exclusive* hotels to prevent duplicates on re-run
    db.prepare("DELETE FROM hotels WHERE is_package_exclusive = 1").run();

    for (const h of exclusiveHotels) {
        insertHotel.run(h.name, h.location, h.city, h.type, h.rating, h.price, h.image, h.amenities, h.is_package_exclusive);
    }
})();

console.log(`Added ${exclusiveHotels.length} exclusive package hotels successfully!`);
