import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('🔄 Fixing duration format to correct "X Days (X-1) Nights" logic...\n');

try {
    // Get all packages
    const packages = db.prepare('SELECT id, title, duration FROM packages').all();

    console.log(`Found ${packages.length} packages to fix\n`);

    // The current database has "13 Days 14 Nights" which is wrong
    // It should be "14 Days 13 Nights"

    let updatedCount = 0;

    for (const pkg of packages) {
        // Extract days and nights from current format
        const daysMatch = pkg.duration.match(/(\d+)\s+Day/i);
        const nightsMatch = pkg.duration.match(/(\d+)\s+Night/i);

        if (daysMatch && nightsMatch) {
            const currentDays = parseInt(daysMatch[1]);
            const currentNights = parseInt(nightsMatch[1]);

            // Fix: Days should be Nights + 1
            const correctDays = currentNights + 1;
            const correctNights = currentNights;

            const newDuration = `${correctDays} Days ${correctNights} Nights`;

            db.prepare('UPDATE packages SET duration = ? WHERE id = ?').run(newDuration, pkg.id);
            console.log(`✅ Fixed: "${pkg.title}"`);
            console.log(`   ${pkg.duration} → ${newDuration}\n`);
            updatedCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Fix Complete!`);
    console.log(`   Total packages: ${packages.length}`);
    console.log(`   Fixed: ${updatedCount}`);
    console.log('='.repeat(50) + '\n');

    // Verify the changes
    console.log('📋 Current durations in database:');
    const uniqueDurations = db.prepare('SELECT DISTINCT duration FROM packages ORDER BY duration').all();
    uniqueDurations.forEach(d => {
        const count = db.prepare('SELECT COUNT(*) as count FROM packages WHERE duration = ?').get(d.duration);
        console.log(`   - ${d.duration} (${count.count} packages)`);
    });

} catch (error) {
    console.error('❌ Error fixing durations:', error);
} finally {
    db.close();
}
