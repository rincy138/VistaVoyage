
import fs from 'fs';
import path from 'path';
import { destinationsData } from './server/destinations_data.js';

const publicDir = path.join(process.cwd(), 'public');
const missing = [];

destinationsData.forEach(d => {
    if (d.image_url.startsWith('/') && !d.image_url.startsWith('https')) {
        const filePath = path.join(publicDir, d.image_url.substring(1));
        if (!fs.existsSync(filePath)) {
            missing.push({ title: d.title, path: d.image_url });
        }
    }
});

console.log('Missing images:', JSON.stringify(missing));
