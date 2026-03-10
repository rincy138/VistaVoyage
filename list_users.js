import { db } from './server/database.js';
const users = db.prepare('SELECT user_id, name, email FROM users').all();
users.forEach(u => console.log(`${u.user_id}: ${u.name} <${u.email}>`));
