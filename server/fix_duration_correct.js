import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('🔄 Setting all packages to correct "14 Days 13 Nights" format...\n');

try {
    // The original database had "14 days"
    // Correct format: 14 Days 13 Nights
    const correctDuration = '14 Days 13 Nights';

    const result = db.prepare('UPDATE packages SET duration = ?').run(correctDuration);

    console.log(`✅ Updated all ${result.changes} packages to: ${correctDuration}\n`);

    // Verify
    const uniqueDurations = db.prepare('SELECT DISTINCT duration FROM packages').all();
    console.log('📋 Current durations in database:');
    uniqueDurations.forEach(d => {
        const count = db.prepare('SELECT COUNT(*) as count FROM packages WHERE duration = ?').get(d.duration);
        console.log(`   - ${d.duration} (${count.count} packages)`);
    });

} catch (error) {
    console.error('❌ Error:', error);
} finally {
    db.close();
}
