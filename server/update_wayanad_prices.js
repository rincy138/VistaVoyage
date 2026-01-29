
import { db } from './database.js';

const updatePrices = () => {
    try {
        console.log("Updating Wayanad prices...");

        // Check current prices first for debugging
        const before = db.prepare("SELECT id, title, price FROM packages WHERE destination LIKE '%Wayanad%'").all();
        console.log("Prices before update:", before);

        // Update the lowest price package (likely ~6000) to 15500
        const result1 = db.prepare(`
            UPDATE packages 
            SET price = 15500 
            WHERE destination LIKE '%Wayanad%' AND price < 8000
        `).run();
        console.log(`Updated ${result1.changes} low-tier packages to 15500`);

        // Update the mid-tier (likely ~9000) to 19500
        const result2 = db.prepare(`
            UPDATE packages 
            SET price = 19500 
            WHERE destination LIKE '%Wayanad%' AND price >= 8000 AND price < 11000
        `).run();
        console.log(`Updated ${result2.changes} mid-tier packages to 19500`);

        // Update the high-tier (likely ~12000) to 24000
        const result3 = db.prepare(`
            UPDATE packages 
            SET price = 24000 
            WHERE destination LIKE '%Wayanad%' AND price >= 11000 AND price < 14000
        `).run();
        console.log(`Updated ${result3.changes} high-tier packages to 24000`);

    } catch (err) {
        console.error("Error updating prices:", err);
    }
};

updatePrices();
