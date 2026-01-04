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

    -- TOUR PACKAGES TABLE
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

  db.exec(`DROP TABLE IF EXISTS packages;`);
  db.exec(schema);
  seedData();
  console.log('Database initialized with 70+ Destinations successfully');
}

import { destinationsData } from './destinations_data.js';

function seedData() {
  const pkgCount = db.prepare('SELECT count(*) as count FROM packages').get();
  // If we already have 70+ unique packages, we don't need to re-seed unless we want to force refresh
  // For this task, we want to ensure exactly these 70+ are present.
  if (pkgCount.count >= 70) {
    console.log('Database already has 70+ destinations.');
    return;
  }

  console.log('Clearing old packages and seeding 70+ unique Indian destinations...');
  db.prepare('DELETE FROM packages').run();

  const pkgInsert = db.prepare(`
    INSERT INTO packages (
      title, description, destination, price, duration, image_url, available_slots, 
      itinerary, inclusions, exclusions, safety_info, emergency_info, 
      safety_score, crowd_level, eco_score, mood_tags, accessibility_info, festival_info
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

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
      itinerary: JSON.stringify([
        { day: 1, title: "Tea Garden Arrival", desc: "Arrival in Kochi and scenic drive to Munnar. Evening tea tasting." },
        { day: 2, title: "Eravikulam Adventure", desc: "Visit Eravikulam National Park and the Tea Museum." },
        { day: 3, title: "Lake & Dam View", desc: "Visit Mattupetty Dam and Echo Point for stunning lakeside views." },
        { day: 4, title: "Spice Market", desc: "Exploring local spice markets before departure." }
      ]),
      safety_info: "Safe hilly terrain. Professional drivers only.",
      emergency_info: JSON.stringify({ hospital: "Tata General", police: "100", ambulance: "108" }),
      safety_score: 4.8,
      mood_tags: "Nature, Relax, Romantic",
      accessibility_info: JSON.stringify({ wheelchair: true, elderly: true, medical: "5km" }),
      festival_info: JSON.stringify({ month: "January", event: "Tea Hub Festival" })
    },
    "Varanasi": {
      itinerary: JSON.stringify([
        { day: 1, title: "Ganga Aarti", desc: "Evening boat ride and witnessing the grand Ganga Aarti." },
        { day: 2, title: "Temple Trail", desc: "Visiting Kashi Vishwanath and Sarnath." },
        { day: 3, title: "Old City Walk", desc: "Exploring the narrow lanes and silk weaving centers." },
        { day: 4, title: "Sunrise Boat", desc: "Early morning boat ride and departure." }
      ]),
      safety_info: "Safe but crowded areas. Keep belongings secure.",
      emergency_info: JSON.stringify({ hospital: "Heritage Hospital", police: "112", ambulance: "102" }),
      safety_score: 4.2,
      mood_tags: "Spiritual, History, Solo",
      accessibility_info: JSON.stringify({ wheelchair: false, elderly: true, medical: "1km" }),
      festival_info: JSON.stringify({ month: "November", event: "Dev Deepawali" })
    },
    "Goa Beach Retreat": {
      itinerary: JSON.stringify([
        { day: 1, title: "Beach Vibe", desc: "Check-in and evening at Baga Beach." },
        { day: 2, title: "Forts & Views", desc: "Visit Aguada Fort and Chapora Fort." },
        { day: 3, title: "Water Sports", desc: "Para-sailing and jet-skiing at Calangute." },
        { day: 4, title: "Market Farewell", desc: "Anjuna flea market and departure." }
      ]),
      safety_info: "Safe coastal area. Follow lifeguard instructions.",
      emergency_info: JSON.stringify({ hospital: "Manipal Hospital", police: "100", ambulance: "101" }),
      safety_score: 4.5,
      mood_tags: "Relax, Romantic, Friends",
      accessibility_info: JSON.stringify({ wheelchair: true, elderly: true, medical: "2km" }),
      festival_info: JSON.stringify({ month: "February", event: "Goa Carnival" })
    }
  };

  const insertMany = db.transaction((pkgs) => {
    for (const pkg of pkgs) {
      const rich = richPackages[pkg.title] || {};

      // Generate some variance for non-rich ones
      const isRich = !!richPackages[pkg.title];
      const safetyScore = rich.safety_score || (4.2 + Math.random() * 0.8).toFixed(1);
      const ecoScore = Math.floor(Math.random() * 2) + 4;
      const crowdLevel = isRich ? (pkg.title === 'Varanasi' ? 'High' : 'Medium') : ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
      const moodTags = rich.mood_tags || pkg.mood_tags || (pkg.description.toLowerCase().includes('adventure') ? "Adventure, Nature" : "Relax, Nature");

      pkgInsert.run(
        pkg.title,
        pkg.description,
        pkg.destination,
        pkg.price,
        pkg.duration,
        pkg.image_url,
        pkg.available_slots || 15,
        rich.itinerary || JSON.stringify([{ day: 1, title: "Arrival & Welcome", desc: `Welcome to ${pkg.title}. Scenic transfer to your premium stay.` }]),
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
  });

  insertMany(destinationsData);

  console.log(`Success: Seeded ${destinationsData.length} unique Indian destinations!`);
}

export { db };
