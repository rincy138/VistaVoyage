import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure database directory exists
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

const dbPath = path.join(dbDir, 'vistavoyage.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDb() {
  const schema = `
    -- USERS TABLE
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role TEXT CHECK(role IN ('Traveler', 'Agent', 'Admin')) NOT NULL DEFAULT 'Traveler',
      phone VARCHAR(15),
      profile_picture TEXT,
      bio TEXT,
      total_kms DECIMAL(10,2) DEFAULT 0,
      cities_visited TEXT DEFAULT '[]', -- JSON array of city names
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      reset_token VARCHAR(255),
      reset_token_expiry DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- HOTELS TABLE
    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(150) NOT NULL,
      location VARCHAR(150) NOT NULL,
      city VARCHAR(100) NOT NULL,
      type VARCHAR(50),
      rating DECIMAL(2,1),
      price INTEGER,
      image VARCHAR(255),
      amenities TEXT, -- JSON array
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- TAXIS TABLE
    CREATE TABLE IF NOT EXISTS taxis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city VARCHAR(100) NOT NULL,
      type VARCHAR(100) NOT NULL,
      capacity VARCHAR(50),
      price_per_km INTEGER,
      rating DECIMAL(2,1) DEFAULT 4.5,
      features TEXT, -- JSON array
      image VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- UNIFIED FAVORITES TABLE
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi', 'Destination')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- UNIFIED REVIEWS TABLE
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi', 'Destination')) NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      review_date DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );

    -- DESTINATIONS TABLE
    CREATE TABLE IF NOT EXISTS destinations (
      destination_id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_name VARCHAR(100) NOT NULL,
      location VARCHAR(150) NOT NULL,
      description TEXT,
      safety_info TEXT,
      image_url VARCHAR(255)
    );

    -- TOUR PACKAGES TABLE (Deprecated but keeping for schema consistency)
    CREATE TABLE IF NOT EXISTS tour_packages (
      package_id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER NOT NULL,
      destination_id INTEGER NOT NULL,
      package_name VARCHAR(150) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration INTEGER,
      itinerary TEXT,
      availability INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      image_url VARCHAR(255),
      FOREIGN KEY (agent_id) REFERENCES users(user_id),
      FOREIGN KEY (destination_id) REFERENCES destinations(destination_id)
    );

    -- BOOKINGS TABLE
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      item_type TEXT CHECK(item_type IN ('Package', 'Hotel', 'Taxi')) NOT NULL,
      booking_date DATE DEFAULT CURRENT_DATE,
      travel_date DATE,
      guests INTEGER DEFAULT 1,
      status TEXT CHECK(status IN ('Confirmed', 'Cancelled')) DEFAULT 'Confirmed',
      total_amount DECIMAL(10,2),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    -- EVENTS TABLE
    CREATE TABLE IF NOT EXISTS events (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL,
      event_name VARCHAR(150) NOT NULL,
      event_date DATE,
      description TEXT,
      FOREIGN KEY (destination_id) REFERENCES destinations(destination_id)
    );

    -- NOTIFICATIONS TABLE
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT,
      status TEXT CHECK(status IN ('Read', 'Unread')) DEFAULT 'Unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );

    -- PACKAGES TABLE (Comprehensive for MCA Project)
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      destination VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration VARCHAR(50),
      itinerary TEXT,
      image_url VARCHAR(255),
      available_slots INTEGER DEFAULT 10,
      safety_score DECIMAL(2,1) DEFAULT 4.5,
      crowd_level TEXT CHECK(crowd_level IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
      eco_score INTEGER DEFAULT 4,
      mood_tags TEXT,
      accessibility_info TEXT,
      safety_info TEXT,
      emergency_info TEXT,
      festival_info TEXT,
      inclusions TEXT,
      exclusions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- GROUP TRIPS Tables
    CREATE TABLE IF NOT EXISTS group_trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        destination TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        created_by INTEGER NOT NULL,
        invite_code TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'planning',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(created_by) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trip_id) REFERENCES group_trips(id),
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        UNIQUE(trip_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS group_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        paid_by INTEGER NOT NULL,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        split_type TEXT DEFAULT 'equal',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trip_id) REFERENCES group_trips(id),
        FOREIGN KEY(paid_by) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS group_polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trip_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        suggested_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trip_id) REFERENCES group_trips(id),
        FOREIGN KEY(suggested_by) REFERENCES users(user_id)
    );

    CREATE TABLE IF NOT EXISTS group_poll_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        vote_value INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(poll_id) REFERENCES group_polls(id),
        FOREIGN KEY(user_id) REFERENCES users(user_id),
        UNIQUE(poll_id, user_id)
    );

    -- MESSAGES TABLE
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status TEXT CHECK(status IN ('Read', 'Unread')) DEFAULT 'Unread',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(sender_id) REFERENCES users(user_id),
        FOREIGN KEY(receiver_id) REFERENCES users(user_id)
    );
  `;

  // No longer dropping tables on every restart to prevent data loss
  db.exec(schema);
  seedData();
  console.log('Database initialized successfully');
}

import { destinationsData } from './destinations_data.js';

function seedData() {
  const pkgCount = db.prepare('SELECT count(*) as count FROM packages').get();
  const destCount = db.prepare('SELECT count(*) as count FROM destinations').get();
  const hotelCount = db.prepare('SELECT count(*) as count FROM hotels').get();
  const taxiCount = db.prepare('SELECT count(*) as count FROM taxis').get();

  // Marker to detect if we have the correct high-quality Indian dataset
  const hasMunnar = db.prepare('SELECT 1 FROM packages WHERE title = ?').get('Munnar');

  if (pkgCount.count < 70 || destCount.count < 70 || hotelCount.count === 0 || taxiCount.count === 0 || !hasMunnar) {
    console.log('Detected missing or incorrect data. Wiping and re-seeding with 70+ Indian destinations...');

    // Wipe old data
    db.exec('PRAGMA foreign_keys = OFF');
    db.prepare('DELETE FROM packages').run();
    db.prepare('DELETE FROM destinations').run();
    db.prepare('DELETE FROM hotels').run();
    db.prepare('DELETE FROM taxis').run();
    db.exec('PRAGMA foreign_keys = ON');

    const destInsert = db.prepare(`
      INSERT INTO destinations (destination_name, location, description, image_url)
      VALUES (?, ?, ?, ?)
    `);

    const pkgInsert = db.prepare(`
      INSERT INTO packages (
        title, description, destination, price, duration, image_url, available_slots, 
        itinerary, inclusions, exclusions, safety_info, emergency_info, 
        safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const uniqueCityMap = new Map();
    destinationsData.forEach(d => {
      const cityName = d.destination.split(',')[0].trim();
      if (!uniqueCityMap.has(cityName)) {
        uniqueCityMap.set(cityName, d);
      }
    });

    const defaultInclusions = JSON.stringify([
      "Premium Accommodation",
      "Daily Breakfast & Dinner",
      "Private AC Transportation",
      "Expert Local Guide",
      "Entry Tickets to Monuments"
    ]);

    const defaultExclusions = JSON.stringify([
      "Airfare",
      "Lunch",
      "Personal Expenses",
      "Travel Insurance"
    ]);

    const richPackages = {
      "Munnar": {
        itinerary: [
          { day: 1, title: "Tea Garden Arrival & Museum", desc: "Arrive in Munnar, visit Tata Tea Museum, and enjoy a fresh tea tasting session.", image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=2000" },
          { day: 2, title: "Eravikulam & Rajamalai", desc: "Spot Nilgiri Tahr at the National Park and visit the beautiful Lakkam Waterfalls.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000" },
          { day: 3, title: "Lakes & Dams Circuit", desc: "Visit Mattupetty Dam, Echo Point, and enjoy boating at Kundala Arch Dam.", image: "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=2000" }
        ],
        safety_score: 4.8,
        mood_tags: "Nature, Adventure, Hidden Gems"
      },
      "Wayanad": {
        itinerary: [
          { day: 1, title: "Pookode Lake Arrival", desc: "Arrive in Wayanad and visit the India-map shaped Pookode Lake for a serene boating experience.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" },
          { day: 4, title: "Ancient Edakkal Caves", desc: "Explore prehistoric rock carvings that date back to the Neolithic area deep inside caves.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" }
        ],
        safety_score: 4.7,
        mood_tags: "Nature, Adventure, Spiritual"
      }
    };

    const generateDynamicItinerary = (name) => {
      const activities = [
        { t: "Hidden Gems Exploration", d: `Discover the secret spots of ${name} that tourists usually miss.`, img: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000" },
        { t: "Local Culinary Tour", d: `Taste the authentic flavors and street food of ${name} with a local guide.`, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000" },
        { t: "Nature & Landscapes", d: `A photography tour capturing the stunning natural beauty around ${name}.`, img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000" },
        { t: "Historical Walk", d: `Journey through time visiting ancient monuments and landmarks in ${name}.`, img: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000" },
        { t: "Crafts & Shopping", d: `Visit the traditional artisan markets and pick up unique souvenirs from ${name}.`, img: "https://images.unsplash.com/photo-1520038410233-7141f77e49aa?q=80&w=2000" }
      ];

      const itin = [];
      for (let i = 1; i <= 14; i++) {
        const act = activities[(name.length + i) % activities.length];
        itin.push({
          day: i,
          title: i === 1 ? `Welcome to ${name}` : (i === 14 ? `Departure from ${name}` : act.t),
          desc: i === 1 ? `Arrive in the beautiful ${name}. Our guide will pick you up for an orientation.` : act.d,
          image: act.img
        });
      }
      return itin;
    };

    const insertMany = db.transaction((pkgs) => {
      for (const pkg of pkgs) {
        const isRich = !!richPackages[pkg.title];
        const rich = richPackages[pkg.title] || {};

        let finalItinerary = rich.itinerary;
        if (!finalItinerary) {
          finalItinerary = generateDynamicItinerary(pkg.title);
        } else {
          // Pad to 14 days
          if (finalItinerary.length < 14) {
            const dynamic = generateDynamicItinerary(pkg.title);
            finalItinerary = [...finalItinerary, ...dynamic.slice(finalItinerary.length)];
          }
        }

        const safetyScore = rich.safety_score || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
        const ecoScore = isRich ? 5 : Math.floor(Math.random() * 3) + 3;
        const crowdLevel = isRich ? (pkg.title === 'Varanasi' ? 'High' : 'Medium') : ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
        const moodTags = rich.mood_tags || pkg.mood_tags || (pkg.description.toLowerCase().includes('adventure') ? "Adventure, Nature" : "Relax, Nature");

        pkgInsert.run(
          pkg.title,
          pkg.description,
          pkg.destination,
          pkg.price,
          "14 days",
          pkg.image_url,
          pkg.available_slots || 15,
          JSON.stringify(finalItinerary),
          pkg.inclusions || defaultInclusions,
          pkg.exclusions || defaultExclusions,
          rich.safety_info || "Standard safety protocols apply. Professional guides provided.",
          rich.emergency_info || JSON.stringify({ hospital: "Nearby General", police: "100", ambulance: "102" }),
          safetyScore,
          crowdLevel,
          ecoScore,
          moodTags,
          rich.accessibility_info || JSON.stringify({ wheelchair: true, elderly: true, medical: "2km" }),
          rich.festival_info || JSON.stringify({ month: "October", event: "Local Cultural Festival" })
        );
      }

      // Seed destinations table (using destInsert from parent scope)
      for (const city of uniqueCityMap.values()) {
        destInsert.run(city.title, city.destination, city.description, city.image_url);
      }

      // Seed Hotels
      const hotelInsert = db.prepare(`
        INSERT INTO hotels (name, location, city, type, rating, price, image, amenities)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const hotelsData = [
        { name: "Blanket Hotel and Spa", location: "Attukad Falls, Munnar", city: "Munnar", type: "Mountain", rating: 5, price: 10500, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Infinity Pool", "Waterfall View"] },
        { name: "ITC Grand Goa Resort", location: "Arossim Beach, Goa", city: "Goa", type: "Beach", rating: 5, price: 18500, image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3", amenities: ["Private Beach", "Village Style"] },
        { name: "The Leela Palace", location: "Lake Pichola, Udaipur", city: "Udaipur", type: "Heritage", rating: 5, price: 28000, image: "https://images.unsplash.com/photo-1549463387-92c21a1d1235", amenities: ["Lake View", "Royal Decor"] },
        { name: "The Himalayan", location: "Hadimba Rd, Manali", city: "Manali", type: "Mountain", rating: 4.8, price: 14200, image: "https://images.unsplash.com/photo-1544085311-11a028465b03", amenities: ["Castle Stay", "Mountain Pool"] },
        { name: "The Grand Dragon Ladakh", location: "Leh", city: "Leh Ladakh", type: "Mountain", rating: 4.9, price: 10500, image: "https://images.unsplash.com/photo-1594220551065-9f9fa9bd36d9", amenities: ["Eco-Friendly", "Kashmiri Cuisine"] },
        { name: "The Khyber Himalayan Resort", location: "Gulmarg Rd, Srinagar", city: "Srinagar", type: "Mountain", rating: 5, price: 25800, image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272", amenities: ["Mountain Views", "Ski Access"] },
        { name: "The Tamara Coorg", location: "Yevakapadi, Coorg", city: "Coorg", type: "Mountain", rating: 4.9, price: 19800, image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb", amenities: ["Plantation Walk", "Infinite Pool"] },
        { name: "Rambagh Palace", location: "Jaipur", city: "Jaipur", type: "Heritage", rating: 5, price: 72000, image: "https://images.unsplash.com/photo-1590611380053-da643716d82b", amenities: ["Royal Gardens", "Heritage Decor"] },
        { name: "BrijRama Palace", location: "Darbhanga Ghat, Varanasi", city: "Varanasi", type: "Heritage", rating: 4.9, price: 24500, image: "https://images.unsplash.com/photo-1561224737-268153600bef", amenities: ["Ganges River View", "Historic Palace"] }
      ];

      hotelsData.forEach(h => {
        hotelInsert.run(h.name, h.location, h.city, h.type, h.rating, h.price, h.image, JSON.stringify(h.amenities));
      });

      // Seed Taxis
      const taxiInsert = db.prepare(`
        INSERT INTO taxis (city, type, capacity, price_per_km, rating, features, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

      const cities = ["Munnar", "Goa", "Udaipur", "Manali", "Leh Ladakh", "Srinagar", "Coorg", "Wayanad", "Jaipur", "Varanasi", "Rishikesh", "Andaman", "Mumbai", "Delhi", "Bengaluru", "Agra", "Shimla", "Jodhpur", "Alleppey"];
      const carImages = [
        "https://images.unsplash.com/photo-1550355403-51975078382d",
        "https://images.unsplash.com/photo-1549194388-f61be84a6e9e",
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
        "https://images.unsplash.com/photo-1563720223185-11003d516935"
      ];

      cities.forEach((city, cityIdx) => {
        const taxiTypes = [
          { type: "Sedan (Premium)", cap: "4 People", price: 15 },
          { type: "SUV (Luxury)", cap: "6-7 People", price: 22 },
          { type: "Electric Sedan", cap: "4 People", price: 18 }
        ];

        taxiTypes.forEach((t, i) => {
          const image = carImages[(cityIdx + i) % carImages.length];
          const rating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
          taxiInsert.run(city, t.type, t.cap, t.price, rating, JSON.stringify(["Verified Driver", "AC", "GPS Tracking"]), `${image}?auto=format&fit=crop&w=1000&q=80&sig=${cityIdx}-${i}`);
        });
      });

    });

    try {
      insertMany(destinationsData);
      console.log(`Success: Seeded ${destinationsData.length} unique Indian destinations, hotels and taxis!`);
    } catch (err) {
      console.error('Error during seeding:', err.message);
      throw err;
    }
  } else {
    console.log('Database already has correct Indian destinations.');
  }
}

export { db };
