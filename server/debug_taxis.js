
import { db } from './database.js';

const taxis = db.prepare("SELECT * FROM taxis WHERE is_package_exclusive = 1 AND city = 'Coimbatore'").all();
console.log(JSON.stringify(taxis, null, 2));
