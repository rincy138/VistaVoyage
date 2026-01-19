import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('🔄 Updating package durations to "Days and Nights" format...\n');
console.log('Database path:', dbPath, '\n');

// Mapping of old format to new format
const durationMapping = {
    '1-2 days': '1 Day 2 Nights',
    '2-3 days': '2 Days 3 Nights',
    '3-4 days': '3 Days 4 Nights',
    '4-5 days': '4 Days 5 Nights',
    '5-6 days': '5 Days 6 Nights',
    '6-7 days': '6 Days 7 Nights',
    '7-8 days': '7 Days 8 Nights',
    '8-9 days': '8 Days 9 Nights',
    '9-10 days': '9 Days 10 Nights',
    '10-11 days': '10 Days 11 Nights',
    '11-12 days': '11 Days 12 Nights',
    '12-13 days': '12 Days 13 Nights',
    '13-14 days': '13 Days 14 Nights',
    '14 days': '13 Days 14 Nights'
};

try {
    // Get all packages with their current durations
    const packages = db.prepare('SELECT id, title, duration FROM packages').all();

    console.log(`Found ${packages.length} packages to check\n`);

    let updatedCount = 0;

    // Update each package
    for (const pkg of packages) {
        const oldDuration = pkg.duration.toLowerCase().trim();
        const newDuration = durationMapping[oldDuration];

        if (newDuration) {
            db.prepare('UPDATE packages SET duration = ? WHERE id = ?').run(newDuration, pkg.id);
            console.log(`✅ Updated: "${pkg.title}"`);
            console.log(`   ${pkg.duration} → ${newDuration}\n`);
            updatedCount++;
        } else {
            console.log(`⚠️  Skipped: "${pkg.title}" (duration: "${pkg.duration}" - no mapping found)\n`);
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Update Complete!`);
    console.log(`   Total packages: ${packages.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${packages.length - updatedCount}`);
    console.log('='.repeat(50) + '\n');

    // Verify the changes
    console.log('📋 Current durations in database:');
    const uniqueDurations = db.prepare('SELECT DISTINCT duration FROM packages ORDER BY duration').all();
    uniqueDurations.forEach(d => {
        const count = db.prepare('SELECT COUNT(*) as count FROM packages WHERE duration = ?').get(d.duration);
        console.log(`   - ${d.duration} (${count.count} packages)`);
    });

} catch (error) {
    console.error('❌ Error updating durations:', error);
} finally {
    db.close();
}
