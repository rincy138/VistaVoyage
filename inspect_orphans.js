
import { db } from './server/database.js';
const pkgOrphans = db.prepare("SELECT count(*) as count FROM bookings b LEFT JOIN packages p ON b.item_id = p.id WHERE b.item_type = 'Package' AND p.id IS NULL").get();
const hotelOrphans = db.prepare("SELECT count(*) as count FROM bookings b LEFT JOIN hotels h ON b.item_id = h.id WHERE b.item_type = 'Hotel' AND h.id IS NULL").get();
const taxiOrphans = db.prepare("SELECT count(*) as count FROM bookings b LEFT JOIN taxis t ON b.item_id = t.id WHERE b.item_type = 'Taxi' AND t.id IS NULL").get();

console.log('Orphaned Packages:', pkgOrphans.count);
console.log('Orphaned Hotels:', hotelOrphans.count);
console.log('Orphaned Taxis:', taxiOrphans.count);
