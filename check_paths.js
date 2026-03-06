
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

console.log('__dirname:', __dirname);
console.log('distPath:', distPath);
console.log('Exists:', fs.existsSync(distPath));
