
import { db } from './server/database.js';
const sql = db.prepare('SELECT sql FROM sqlite_master WHERE name="bookings"').get().sql;
console.log(sql);
