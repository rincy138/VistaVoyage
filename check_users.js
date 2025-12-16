import { db } from './server/database.js';

const users = db.prepare('SELECT id, name, email, role FROM users').all();
console.log(JSON.stringify(users, null, 2));
