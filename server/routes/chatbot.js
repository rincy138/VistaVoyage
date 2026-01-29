import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.post('/message', (req, res) => {
    const { message } = req.body;
    let responseText = "I can help you with this! We have amazing Hotels, Taxis, and Packages. Just tell me your destination name.";

    if (!message) {
        return res.json({ response: responseText });
    }

    const query = message.toLowerCase();

    try {
        // 0. Greetings
        if (query.match(/^(hi|hello|hey|greetings|sup|yo)/)) {
            responseText = "Hello! 👋 I'm your VistaVoyage assistant. I can help you plan your perfect trip! \n\nTry asking for:\n🌴 Relaxing getaways\n🏔️ Adventure trips\n🏨 Hotels in Goa\n🚖 Taxis in Munnar";
        }

        // 1. Hotels Query
        else if (query.includes('hotel') || query.includes('stay') || query.includes('room')) {
            const cityMatch = query.match(/(?:in|at|near)\s+(\w+)/) || query.match(/(\w+)\s+hotels?/); // More flexible regex
            if (cityMatch || query.includes('munnar') || query.includes('goa')) { // Fallback for common cities if regex misses
                // Extract city from flexible match or common known cities
                let city = cityMatch ? cityMatch[1] : (query.includes('munnar') ? 'munnar' : 'goa');

                // Capitalize for display 
                const displayCity = city.charAt(0).toUpperCase() + city.slice(1);

                const hotels = db.prepare('SELECT name, price, rating FROM hotels WHERE city LIKE ? LIMIT 3').all(`%${city}%`);

                if (hotels.length > 0) {
                    const hotelList = hotels.map(h => `🏨 ${h.name}\n   (₹${h.price}/night • ⭐${h.rating})`).join('\n\n');
                    responseText = `I found these great hotels in ${displayCity}:\n\n${hotelList}\n\n✨ For more options and full galleries, head over to the 'Hotels' page!`;
                } else {
                    responseText = `I couldn't find any hotels in ${displayCity}. Try another city like Goa, Mumbai, or Jaipur.`;
                }
            } else {
                responseText = "I can help you find hotels! Just say 'hotels in Goa' or 'stay in Mumbai'.";
            }
        }

        // 2. Taxis Query
        else if (query.includes('taxi') || query.includes('cab') || query.includes('car')) {
            const cityMatch = query.match(/(?:in|at)\s+(\w+)/);
            if (cityMatch) {
                const city = cityMatch[1];
                const taxis = db.prepare('SELECT type, price_per_km FROM taxis WHERE city LIKE ? LIMIT 3').all(`%${city}%`);

                if (taxis.length > 0) {
                    const taxiList = taxis.map(t => `🚖 ${t.type}\n   (₹${t.price_per_km}/km)`).join('\n\n');
                    responseText = `I've found these rides available in ${city}:\n\n${taxiList}\n\n📍 You can book your transfer directly on the 'Taxis' page.`;
                } else {
                    responseText = `I couldn't find taxi services in ${city} right now.`;
                }
            } else {
                responseText = "Need a ride? Ask me for 'taxis in Mumbai' or 'cabs in Delhi'.";
            }
        }

        // 3. Packages/Trips Query (ENHANCED)
        else if (query.includes('package') || query.includes('trip') || query.includes('tour') || query.includes('vacation') || query.includes('relax') || query.includes('adventure') || query.includes('weekend')) {

            // Keyword extraction for moods/types
            let moodLike = '%';
            if (query.includes('relax')) moodLike = '%relax%';
            if (query.includes('adventure')) moodLike = '%adventure%';
            if (query.includes('weekend')) moodLike = '%short%'; // Assuming 'short' implies weekend, or just search any

            const destMatch = query.match(/(?:to|for|in)\s+(\w+)/);
            const destination = destMatch ? destMatch[1] : null;

            let packages = [];
            if (destination) {
                packages = db.prepare('SELECT title, price, duration FROM packages WHERE destination LIKE ? OR title LIKE ? LIMIT 3').all(`%${destination}%`, `%${destination}%`);
            } else if (moodLike !== '%') {
                // Search by mood tags or description if we have mood keywords but no destination
                // Note: Ideally, schema should have mood_tags. Using description/title as proxy if not confirmed.
                // Checking if mood_tags exists in previous turns... yes it does in Home.jsx.
                // Let's assume 'mood_tags' column exists. If not, title/desc.
                try {
                    packages = db.prepare('SELECT title, price, duration FROM packages WHERE mood_tags LIKE ? OR description LIKE ? LIMIT 3').all(moodLike, moodLike);
                } catch (e) {
                    // Fallback if mood_tags col doesn't exist
                    packages = db.prepare('SELECT title, price, duration FROM packages WHERE description LIKE ? LIMIT 3').all(moodLike);
                }
            } else {
                // Generic 'plan a trip' without details -> recommend popular ones
                packages = db.prepare('SELECT title, price, duration FROM packages ORDER BY price DESC LIMIT 3').all();
            }

            if (packages.length > 0) {
                const pkgList = packages.map(p => `🌴 ${p.title}\n   (${p.duration} • ₹${p.price})`).join('\n\n');
                if (destination) {
                    responseText = `I found some perfect packages for ${destination}:\n\n${pkgList}\n\n🎒 View the full itineraries in 'Packages'!`;
                } else {
                    responseText = `Based on your style, I recommend these experiences:\n\n${pkgList}\n\n✨ Browse all our holiday deals on the 'Packages' page.`;
                }
            } else {
                responseText = `I'm constantly updating my catalogue. Try checking 'Packages' for 'Kerala', 'Manali', or 'Goa'.`;
            }
        }

        // 3.5 Flight prices (General Mock - Updated for clarity)
        else if (query.includes('flight') || query.includes('fly')) {
            responseText = "VistaVoyage currently focuses on providing premium Ground Services including Hotels, Taxis, and curated Holiday Packages. \n\nCurrently, we don't offer flight bookings, but we can help you with everything else once you land! 🏨🚖";
        }

        // 4. General Weather (Mock - since no real weather API)
        else if (query.includes('weather')) {
            responseText = "For real-time weather, please use our 'Packing Assistant' feature! It gives live forecasts based on your destination.";
        }

        // 5. Offers
        else if (query.includes('offer') || query.includes('discount')) {
            responseText = "Head over to our 'Travel Offers' page! specific deals change daily, but you can find up to 20% off on select packages.";
        }

        // 6. Identify 'thank you'
        else if (query.includes('thank') || query.includes('thx')) {
            responseText = "You're welcome! Happy travels! ✈️";
        }

        // 7. Acknowledgment (ok, okay, cool)
        else if (query.match(/^(ok|okay|okyy|cool|fine|nice|great|good)/)) {
            responseText = "Is there anything else I can help you with for your trip?";
        }

    } catch (error) {
        console.error('Chatbot Error:', error);
        responseText = "I'm having trouble connecting to my brain database right now. Please try again later.";
    }

    res.json({ response: responseText });
});

export default router;
