
import { db } from './database.js';

const updateAllPrices = () => {
    try {
        console.log("Updating ALL package prices to PREMIUM levels...");

        // We apply a ~70% increase to all packages to ensure premium starting rates
        // This makes a standard 15k package -> ~25.5k
        // A 21k package -> ~35.7k
        const result = db.prepare(`
            UPDATE packages 
            SET price = price * 1.7
        `).run();

        console.log(`Updated ${result.changes} packages to premium pricing.`);

        // Log a few examples to verify
        const examples = db.prepare("SELECT title, price FROM packages LIMIT 5").all();
        console.log("New Premium Prices (Examples):", examples);

    } catch (err) {
        console.error("Error updating prices:", err);
    }
};

updateAllPrices();
