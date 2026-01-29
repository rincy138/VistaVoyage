
import { db } from './server/database.js';

const names = db.prepare("SELECT destination_name FROM destinations WHERE image_url LIKE '/%'").all().map(d => d.destination_name);
console.log(JSON.stringify(names));
