
import { db } from './server/database.js';

const users = db.prepare('SELECT user_id, name, email FROM users').all();
console.log('Users in database:', users);
