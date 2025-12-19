import { db } from './database.js';

console.log('Forcing seed data...');

try {
    const packages = [
        {
            title: "Bali Island Escape",
            description: "Experience the magic of Bali with its pristine beaches, vibrant culture, and lush landscapes. Includes hotel and tours.",
            destination: "Bali, Indonesia",
            price: 1200,
            duration: "5 Days / 4 Nights",
            image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938",
            available_slots: 15
        },
        {
            title: "Santorini Sunset Dream",
            description: "Watch the world's most beautiful sunset in Oia. Enjoy wine tasting, boat tours, and luxury accommodation.",
            destination: "Santorini, Greece",
            price: 1800,
            duration: "7 Days / 6 Nights",
            image_url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1929",
            available_slots: 8
        },
        {
            title: "Kyoto Cultural Journey",
            description: "Immerse yourself in ancient Japanese tradition. Visit temples, participate in tea ceremonies, and see the cherry blossoms.",
            destination: "Kyoto, Japan",
            price: 2100,
            duration: "6 Days / 5 Nights",
            image_url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070",
            available_slots: 12
        },
        {
            title: "Paris Romantic Getaway",
            description: "The city of lights awaits. Dinner at the Eiffel Tower, Seine river cruise, and Louvre museum tour included.",
            destination: "Paris, France",
            price: 2500,
            duration: "5 Days / 4 Nights",
            image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073",
            available_slots: 10
        },
        {
            title: "New York City Adventure",
            description: "Explore the Big Apple. Times Square, Central Park, Broadway show tickets, and Statue of Liberty tour.",
            destination: "New York, USA",
            price: 1900,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070",
            available_slots: 20
        },
        {
            title: "Swiss Alps Ski Trip",
            description: "World-class skiing in Zermatt. Cosy chalets, fondue dinners, and breathtaking mountain views.",
            destination: "Zermatt, Switzerland",
            price: 3200,
            duration: "7 Days / 6 Nights",
            image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070",
            available_slots: 5
        }
    ];

    const stmt = db.prepare('INSERT INTO packages (title, description, destination, price, duration, image_url, available_slots) VALUES (?, ?, ?, ?, ?, ?, ?)');

    // Clear existing to avoid duplicates if partial
    db.prepare('DELETE FROM packages').run();

    const insertMany = db.transaction((packages) => {
        for (const pkg of packages) stmt.run(pkg.title, pkg.description, pkg.destination, pkg.price, pkg.duration, pkg.image_url, pkg.available_slots);
    });

    insertMany(packages);
    console.log('Seed successful!');
} catch (error) {
    console.error('Seed failed:', error);
}
