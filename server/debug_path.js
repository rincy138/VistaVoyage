import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
console.log('Resolved path:', dbPath);
console.log('Exists:', fs.existsSync(dbPath));
console.log('Parent Dir Exists:', fs.existsSync(path.join(__dirname, 'data')));
