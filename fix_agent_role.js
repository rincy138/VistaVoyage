
import { db } from './server/database.js';

console.log("Updating agent@gmail.com to Role: Agent");
const info = db.prepare("UPDATE users SET role = 'Agent' WHERE email = 'agent@gmail.com'").run();
console.log(`Changes: ${info.changes}`);

console.log("Verifying...");
const user = db.prepare("SELECT email, role FROM users WHERE email = 'agent@gmail.com'").get();
console.log(user);
