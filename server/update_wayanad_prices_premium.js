
import { db } from './database.js';

const updatePrices = () => {
    try {
        console.log("Updating Wayanad prices to PREMIUM...");

        // Update ALL Wayanad packages to 35000 to ensure premium pricing
        // This assumes the duration is around 5-7 days.
        const result = db.prepare(`
            UPDATE packages 
            SET price = 35000 
            WHERE destination LIKE '%Wayanad%'
        `).run();

        console.log(`Updated ${result.changes} Wayanad packages to 35000.`);

        // Verify
        const after = db.prepare("SELECT id, title, price, duration FROM packages WHERE destination LIKE '%Wayanad%'").all();
        console.log("Prices after update:", after);

    } catch (err) {
        console.error("Error updating prices:", err);
    }
};

updatePrices();
