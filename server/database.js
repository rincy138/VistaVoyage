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

  db.exec(`DROP TABLE IF EXISTS bookings;`);
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
        { day: 1, title: "Tea Garden Arrival & Museum", desc: "Arrive in Munnar, visit Tata Tea Museum, and enjoy a fresh tea tasting session.", image: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=2000" },
        { day: 2, title: "Eravikulam & Rajamalai", desc: "Spot Nilgiri Tahr at the National Park and visit the beautiful Lakkam Waterfalls.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000" },
        { day: 3, title: "Lakes & Dams Circuit", desc: "Visit Mattupetty Dam, Echo Point, and enjoy boating at Kundala Arch Dam.", image: "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=2000" },
        { day: 4, title: "Top Station Hike", desc: "Head to the highest point for panoramic views of Tamil Nadu and the Western Ghats.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000" },
        { day: 5, title: "Pothamedu & Attukal", desc: "Panoramic plantation views followed by a trek to the misty Attukal Falls.", image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2000" },
        { day: 6, title: "Vattavada Village Tour", desc: "Visit the 'Vegetable Village' for terraced farms of strawberries and oranges.", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2000" },
        { day: 7, title: "Marayoor Sandalwood Forest", desc: "Walk through natural sandalwood groves and visit 2000-year-old Muniyara Dolmens.", image: "https://images.unsplash.com/photo-1516233758813-a38d024919c5?q=80&w=2000" },
        { day: 8, title: "Chinnar Wildlife Sanctuary", desc: "A guided forest trek to spot wild elephants and visit the Thoovanam Waterfalls.", image: "https://images.unsplash.com/photo-1581012771300-224937651c42?q=80&w=2000" },
        { day: 9, title: "Meesapulimala Trek", desc: "The ultimate challenge—trekking through Rhodo Valley to the second highest peak.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000" },
        { day: 10, title: "Anayirangal Lake", desc: "Serene lakeside picnics and elephant watching at the elephant-arriving point.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" },
        { day: 11, title: "Kolukkumalai Sunrise", desc: "Early morning 4x4 jeep ride to the world's highest organic tea plantation.", image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2000" },
        { day: 12, title: "Lockhart Gap & Cave", desc: "Visit the heart-shaped gap and the ancient Malayil Kallan Cave.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000" },
        { day: 13, title: "Devikulam & Sita Devi Lake", desc: "Peaceful retreat at the crystal clear sacred lake surrounded by Shola forests.", image: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000" },
        { day: 14, title: "Kanthalloor Fruit Orchard", desc: "Visit the fruit paradise of Munnar to see apples, plums, and quinces before departure.", image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000" }
      ]),
      safety_info: "Safe hilly terrain. Professional 4x4 drivers provided for high altitude spots.",
      emergency_info: JSON.stringify({ hospital: "Tata General", police: "100", ambulance: "108" }),
      safety_score: 4.8,
      mood_tags: "Nature, Adventure, Hidden Gems",
      accessibility_info: JSON.stringify({ wheelchair: true, elderly: true, medical: "5km" }),
      festival_info: JSON.stringify({ month: "January", event: "Tea Hub Festival" })
    },
    "Wayanad": {
      itinerary: JSON.stringify([
        { day: 1, title: "Pookode Lake Arrival", desc: "Arrive in Wayanad and visit the India-map shaped Pookode Lake for a serene boating experience.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" },
        { day: 2, title: "Chembra Peak Trekking", desc: "Trek to the highest point of Wayanad and see the famous heart-shaped mountain lake.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000" },
        { day: 3, title: "Soochipara Waterfalls", desc: "Visit the stunning Sentinel Rock Falls, perfect for a refreshing dip in natural pools.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2000" },
        { day: 4, title: "Ancient Edakkal Caves", desc: "Explore prehistoric rock carvings that date back to the Neolithic area deep inside caves.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
        { day: 5, title: "Banasura Sagar Adventure", desc: "Visit India's largest earthen dam. Enjoy speed boating and trekking to Banasura Peak.", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000" },
        { day: 6, title: "Muthanga Wildlife Safari", desc: "A thrilling jungle safari to spot elephants, deer, and if lucky, the Wayanad Tiger.", image: "https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=2000" },
        { day: 7, title: "Kuruvadweep Bamboo Rafting", desc: "Explore a river delta. Walk through dense forests and try traditional bamboo rafting.", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2000" },
        { day: 8, title: "Neelimala Viewpoint", desc: "Breathtaking views of the Meenmutty falls from the edge of a cliff. A photographer's dream.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000" },
        { day: 10, title: "En Ooru Tribal Village", desc: "Visit India's first tribal heritage village and learn about indigenous way of life.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
        { day: 11, title: "Meenmutty Giant Falls", desc: "Trek through the jungle to reach the most majestic 3-tiered waterfall of North Kerala.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2000" },
        { day: 12, title: "Thollayiram Kandi Valley", desc: "Walk on the Glass Bridge over the '900 acres' of dense hidden valleys and rainforest.", image: "https://images.unsplash.com/photo-1522012188892-24beb302783d?q=80&w=2000" },
        { day: 13, title: "Cheengeri Hills Sunrise", desc: "Early morning rock climbing and trekking for a panoramic view of the misty district.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000" },
        { day: 14, title: "Souvenirs & Departure", desc: "Shopping for spices and forest honey before your scenic return journey starts.", image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000" }
      ]),
      safety_info: "Dense forest area. Always follow official forest department timings during safaris.",
      emergency_info: JSON.stringify({ hospital: "Meppadi WIMS", police: "100", ambulance: "108" }),
      safety_score: 4.7,
      mood_tags: "Nature, Adventure, Spiritual",
      accessibility_info: JSON.stringify({ wheelchair: false, elderly: true, medical: "10km" }),
      festival_info: JSON.stringify({ month: "January", event: "Valliyoorkavu Festival" })
    },
    "Varanasi": {
      itinerary: JSON.stringify([
        { day: 1, title: "Ganga Aarti", desc: "Evening boat ride and witnessing the grand Ganga Aarti.", image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000" },
        { day: 2, title: "Temple Trail", desc: "Visiting Kashi Vishwanath and Sarnath.", image: "https://images.unsplash.com/photo-1590050752117-23aae2fc28ee?q=80&w=2000" },
        { day: 3, title: "Old City Walk", desc: "Exploring the narrow lanes and silk weaving centers.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
        { day: 4, title: "Sunrise Boat", desc: "Early morning boat ride and departure.", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000" }
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
        { day: 1, title: "Beach Vibe", desc: "Check-in and evening at Baga Beach.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000" },
        { day: 2, title: "Forts & Views", desc: "Visit Aguada Fort and Chapora Fort.", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=2000" },
        { day: 3, title: "Water Sports", desc: "Para-sailing and jet-skiing at Calangute.", image: "https://images.unsplash.com/photo-1547127796-06bb04e4b315?q=80&w=2000" },
        { day: 4, title: "Market Farewell", desc: "Anjuna flea market and departure.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" }
      ]),
      safety_info: "Safe coastal area. Follow lifeguard instructions.",
      emergency_info: JSON.stringify({ hospital: "Manipal Hospital", police: "100", ambulance: "101" }),
      safety_score: 4.5,
      mood_tags: "Relax, Romantic, Friends",
      accessibility_info: JSON.stringify({ wheelchair: true, elderly: true, medical: "2km" }),
      festival_info: JSON.stringify({ month: "February", event: "Goa Carnival" })
    },
    "Manali": {
      itinerary: JSON.stringify([
        { day: 1, title: "Mall Road & Hidimba", desc: "Arrive in Manali, explore the pine-scented Hadimba Devi Temple and evening walk on Mall Road.", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000" },
        { day: 2, title: "Solang Valley Adventure", desc: "A day of paragliding, zorbing, and taking in the panoramic snowy mountain views.", image: "https://images.unsplash.com/photo-1544281679-5109ec13a493?q=80&w=2000" },
        { day: 3, title: "Old Manali Cafes", desc: "Cross the Manalsu river to find the bohemian soul of Manali with river-side cafes.", image: "https://images.unsplash.com/photo-1605649440416-43f1624466b0?q=80&w=2000" },
        { day: 4, title: "Rohtang Pass Snow", desc: "High altitude adventure at the gateway to Lahaul, playing in year-round snow.", image: "https://images.unsplash.com/photo-1596700424578-831861053075?q=80&w=2000" },
        { day: 5, title: "Jogini Falls Trek", desc: "A scenic hike through apple orchards to reach the sacred Jogini Waterfalls.", image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?q=80&w=2000" }
      ]),
      mood_tags: "Snow, Adventure, Cafes"
    },
    "Goa": {
      itinerary: JSON.stringify([
        { day: 1, title: "Baga & Calangute", desc: "Welcome to the sunshine state. Enjoy the lively shacks and water sports of North Goa.", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000" },
        { day: 2, title: "Old Goa Heritage", desc: "Visit the UNESCO World Heritage Basilica of Bom Jesus and the grand SE Cathedral.", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=2000" },
        { day: 3, title: "Dudhsagar Waterfalls", desc: "A thrilling jeep safari through the Mollem National Park to the 'Sea of Milk' falls.", image: "https://images.unsplash.com/photo-1589136140230-dcbc77607994?q=80&w=2000" },
        { day: 4, title: "Palolem Serenity", desc: "Head south for the beautiful crescent beach. Kayaking and dolphin spotting at sunrise.", image: "https://images.unsplash.com/photo-1547127796-06bb04e4b315?q=80&w=2000" }
      ]),
      mood_tags: "Beach, Party, Heritage"
    },
    "Rishikesh": {
      itinerary: JSON.stringify([
        { day: 1, title: "Ganga Aarti at Triveni", desc: "Experience the spiritual energy of the evening prayer ceremony on the banks of Ganga.", image: "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=2000" },
        { day: 2, title: "White Water Rafting", desc: "An adrenaline-pumping ride through the rapids of the holy Ganges river.", image: "https://images.unsplash.com/photo-1530933703565-d41c88825c88?q=80&w=2000" },
        { day: 3, title: "Beatles Ashram", desc: "Walk through the graffiti-covered ruins where the Beatles once studied meditation.", image: "https://images.unsplash.com/photo-1545208393-216671fe4323?q=80&w=2000" }
      ]),
      mood_tags: "Spirituality, Adventure, Yoga"
    },
    "Alleppey": {
      itinerary: JSON.stringify([
        { day: 1, title: "Houseboat Check-in", desc: "Board your premium wooden houseboat for a cruise through the emerald backwaters.", image: "https://images.unsplash.com/photo-1593693397690-362ae9666ec2?q=80&w=2000" },
        { day: 2, title: "Village Life Tour", desc: "Explore the narrow canals in a traditional canoe and see the local coir making.", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000" }
      ]),
      mood_tags: "Backwaters, Relax, Romantic"
    },
    "Ladakh": {
      itinerary: JSON.stringify([
        { day: 1, title: "Acclimatization in Leh", desc: "Take it slow to adjust to the high altitude. Visit Shanti Stupa in the evening.", image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2000" },
        { day: 2, title: "Nubra Valley via Khardungla", desc: "Cross the highest motorable road to reach the cold desert sand dunes of Hunder.", image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2000" },
        { day: 3, title: "Pangong Tso Blue", desc: "Drive to the high altitude lake that changes colors from azure to emerald.", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000" }
      ]),
      mood_tags: "Adventure, Mountains, Biking"
    }
  };

  const generateDynamicItinerary = (name) => {
    const activities = [
      { t: "Hidden Gems Exploration", d: `Discover the secret spots of ${name} that tourists usually miss.`, img: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000" },
      { t: "Local Culinary Tour", d: `Taste the authentic flavors and street food of ${name} with a local guide.`, img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000" },
      { t: "Nature & Landscapes", d: `A photography tour capturing the stunning natural beauty around ${name}.`, img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000" },
      { t: "Historical Walk", d: `Journey through time visiting ancient monuments and landmarks in ${name}.`, img: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000" },
      { t: "Crafts & Shopping", d: `Visit the traditional artisan markets and pick up unique souvenirs from ${name}.`, img: "https://images.unsplash.com/photo-1520038410233-7141f77e49aa?q=80&w=2000" },
      { t: "Sunrise Viewpoint", d: `Early morning hike to the best peak for a panoramic sunrise over ${name}.`, img: "https://images.unsplash.com/photo-1475924156734-496f6acc6ec9?q=80&w=2000" },
      { t: "Cultural Workshop", d: `Learn a local craft or dance form from the experts in ${name}.`, img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000" },
      { t: "Spiritual Presence", d: `Find peace at the most tranquil temples and shrines across ${name}.`, img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000" },
      { t: "Adventure Pursuit", d: `Push your limits with off-road activities and trekking in the outskirts.`, img: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=2000" },
      { t: "Relaxing Sunset Cruise", d: "Wind down the day with a peaceful cruise or lakeside walk watching the sun dip.", img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000" }
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
    return JSON.stringify(itin);
  };

  const insertMany = db.transaction((pkgs) => {
    for (const pkg of pkgs) {
      const isRich = !!richPackages[pkg.title];
      const rich = richPackages[pkg.title] || {};

      let finalItinerary = rich.itinerary;
      if (!finalItinerary) {
        finalItinerary = generateDynamicItinerary(pkg.title);
      } else {
        // If it's a rich package but has less than 14 days, pad it locally
        const parsed = JSON.parse(finalItinerary);
        if (parsed.length < 14) {
          const dynamic = JSON.parse(generateDynamicItinerary(pkg.title));
          finalItinerary = JSON.stringify([...parsed, ...dynamic.slice(parsed.length)]);
        }
      }

      const safetyScore = rich.safety_score || (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
      const ecoScore = isRich ? 5 : Math.floor(Math.random() * 3) + 3;
      const crowdLevel = isRich ? (pkg.title === 'Varanasi' ? 'High' : 'Medium') : ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
      const moodTags = rich.mood_tags || pkg.mood_tags || (pkg.description.toLowerCase().includes('adventure') ? "Adventure, Nature" : "Relax, Nature");

      const duration = "14 days"; // Force all to 14 days for the new premium experience

      pkgInsert.run(
        pkg.title,
        pkg.description,
        pkg.destination,
        pkg.price,
        duration,
        pkg.image_url,
        pkg.available_slots || 15,
        finalItinerary,
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
