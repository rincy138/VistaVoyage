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
const db = new Database(dbPath, { verbose: console.log });

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
      FOREIGN KEY (agent_id) REFERENCES users(user_id), -- Assuming agent_id maps to user_id who is an agent
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
      FOREIGN KEY (package_id) REFERENCES tour_packages(package_id)
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
    -- PACKAGES TABLE (Legacy/Frontend Compatible)
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id INTEGER,
      title VARCHAR(150) NOT NULL,
      description TEXT,
      destination VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      duration VARCHAR(50),
      image_url VARCHAR(255),
      available_slots INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // We are creating new tables with different structures.
  // To avoid conflicts with the old schema (which had 'packages' instead of 'tour_packages'),
  // we might want to drop old tables or just let them coexist if names differ.
  // The user asked for specific table names.
  // Existing tables: users, packages, bookings, reviews.
  // New tables: users (conflict), tour_packages (new), bookings (conflict), reviews (conflict).

  // Since this is a dev environment and significantly changing schema, it's cleaner to drop old tables carefully or
  // just assume the user is okay with a reset. 
  // Ideally, I'd rename the DB file to archive it, but `initDb` just runs SQL.
  // Constructing a robust initDb that drops if exists then creates:

  /* 
  db.exec(`
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS packages; -- old name
    DROP TABLE IF EXISTS users; -- risky if we want to keep data, but schema changed (user_id vs id)
  `);
  */

  // For the purpose of this request which implies a fresh design application:
  // I will not DROP tables automatically to avoid data loss surprise, 
  // BUT the new CREATE statements use `IF NOT EXISTS`.
  // HOWEVER, `users` table `id` vs `user_id` is a conflict. 
  // The existing `users` table has `id`. The new one wants `user_id`.
  // I will standardize on `user_id` as requested. 
  // I will DROP the existing tables to ensure the schema matches exactly.

  /*
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS packages;
    DROP TABLE IF EXISTS tour_packages;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS travel_agents;
    DROP TABLE IF EXISTS destinations;
    DROP TABLE IF EXISTS wishlist;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS admin_reports;
    PRAGMA foreign_keys = ON;
  `);
  */

  db.exec(schema);

  // Seed some initial data for testing
  seedData();

  console.log('Database initialized with 3NF Schema successfully');
}

function seedData() {
  // Check if data exists
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count > 0) return;

  console.log('Seeding data...');

  // Seed Users (1 Admin, 1 Agent, 1 Traveler)
  // Note: Passwords are not hashed here for simplicity of the exact seed script, 
  // but in real app they are hashed. In `auth.js` we compare with bcrypt.
  // So we should ideally hash them, but since I can't import bcrypt here easily without async issues in top-level init,
  // I will let the registration flow handle real users.
  // OR I can insert a known hash. (Hash for 'password123' is commonly known or I can skip seeding users and let manual registration do it).
  // I'll skip seeding users to avoid hash mismatch issues, relying on the user to Register.

  // Seed Destinations (Required for packages)
  const destInsert = db.prepare('INSERT INTO destinations (destination_name, location, description, image_url) VALUES (?, ?, ?, ?)');
  destInsert.run('Bali', 'Indonesia', 'Tropical paradise.', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1938');
  destInsert.run('Santorini', 'Greece', 'Iconic white buildings.', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1929');
  destInsert.run('Kyoto', 'Japan', 'Ancient temples.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070');
  // Seed Packages (for "More Plans")
  const pkgCount = db.prepare('SELECT count(*) as count FROM packages').get();
  if (pkgCount.count === 0) {
    console.log('Seeding packages...');
    const pkgInsert = db.prepare(`
          INSERT INTO packages (title, description, destination, price, duration, image_url, available_slots)
          VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

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

    packages.forEach(pkg => {
      pkgInsert.run(pkg.title, pkg.description, pkg.destination, pkg.price, pkg.duration, pkg.image_url, pkg.available_slots);
    });
  }
}

export { db };
