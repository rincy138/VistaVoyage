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
      status TEXT CHECK(status IN ('Active', 'Inactive')) DEFAULT 'Active',
      reset_token VARCHAR(255),
      reset_token_expiry DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- TRAVEL AGENTS TABLE
    CREATE TABLE IF NOT EXISTS travel_agents (
      agent_id INTEGER PRIMARY KEY,
      agency_name VARCHAR(150),
      license_no VARCHAR(50),
      approval_status TEXT CHECK(approval_status IN ('Pending', 'Approved')) DEFAULT 'Pending',
      joined_date DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (agent_id) REFERENCES users(user_id) ON DELETE CASCADE
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
      booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      booking_date DATE DEFAULT CURRENT_DATE,
      travel_date DATE,
      custom_duration VARCHAR(50),
      status TEXT CHECK(status IN ('Booked', 'Cancelled')) DEFAULT 'Booked',
      total_amount DECIMAL(10,2),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (package_id) REFERENCES packages(id)
    );

    -- REVIEWS & RATINGS TABLE
    CREATE TABLE IF NOT EXISTS reviews (
      review_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      review TEXT,
      review_date DATE DEFAULT CURRENT_DATE,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (package_id) REFERENCES tour_packages(package_id)
    );

    -- WISHLIST TABLE
    CREATE TABLE IF NOT EXISTS wishlist (
      wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      package_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (package_id) REFERENCES tour_packages(package_id)
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

    -- ADMIN REPORTS TABLE
    CREATE TABLE IF NOT EXISTS admin_reports (
      report_id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_type VARCHAR(100),
      generated_by INTEGER NOT NULL,
      generated_on DATE DEFAULT CURRENT_DATE,
      report_data TEXT,
      FOREIGN KEY (generated_by) REFERENCES users(user_id)
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

  // Marker to detect if we have the correct high-quality Indian dataset
  const hasMunnar = db.prepare('SELECT 1 FROM packages WHERE title = ?').get('Munnar');

  if (pkgCount.count < 70 || destCount.count < 70 || !hasMunnar) {
    console.log('Detected missing or incorrect data. Wiping and re-seeding with 70+ Indian destinations...');

    // Wipe old data
    db.prepare('DELETE FROM packages').run();
    db.prepare('DELETE FROM destinations').run();

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
    });

    insertMany(destinationsData);
    console.log(`Success: Seeded ${destinationsData.length} unique Indian destinations!`);
  } else {
    console.log('Database already has correct Indian destinations.');
  }
}

export { db };
