
import { db } from './server/database.js';

console.log("Checking coverage for Exclusive Hotels & Taxis...");

// 1. Get all unique cities from packages
// Note: destination formatting might be "Munnar, Kerala", so we split by comma
const packages = db.prepare("SELECT DISTINCT destination FROM packages").all();
const cities = [...new Set(packages.map(p => p.destination.split(',')[0].trim()))];

console.log("Found cities in packages:", cities);

// 2. Check Hotels coverage
const hotelCoverage = db.prepare("SELECT DISTINCT city FROM hotels WHERE is_package_exclusive = 1").all().map(h => h.city);
console.log("Cities with Exclusive Hotels:", hotelCoverage);

// 3. Check Taxis coverage
const taxiCoverage = db.prepare("SELECT DISTINCT city FROM taxis WHERE is_package_exclusive = 1").all().map(t => t.city);
console.log("Cities with Exclusive Taxis:", taxiCoverage);

// 4. Identify missing
const missingHotels = cities.filter(city => !hotelCoverage.includes(city));
const missingTaxis = cities.filter(city => !taxiCoverage.includes(city));

console.log("------------------------------------------------");
if (missingHotels.length > 0) console.log("MISSING Exclusive Hotels for:", missingHotels);
else console.log("All cities have Exclusive Hotels!");

if (missingTaxis.length > 0) console.log("MISSING Exclusive Taxis for:", missingTaxis);
else console.log("All cities have Exclusive Taxis!");
