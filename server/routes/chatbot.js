import express from 'express';
import { db } from '../database.js';

const router = express.Router();

router.post('/message', (req, res) => {
    const { message } = req.body;
    let responseText = "I'm still learning! Try asking about 'hotels in Goa', 'taxis in Mumbai', or 'packages for Kerala'.";

    if (!message) {
        return res.json({ response: responseText });
    }

    const query = message.toLowerCase();

    try {
        // 1. Hotels Query
        if (query.includes('hotel') || query.includes('stay')) {
            const cityMatch = query.match(/in\s+(\w+)/);
            if (cityMatch) {
                const city = cityMatch[1];
                const hotels = db.prepare('SELECT name, price, rating FROM hotels WHERE city LIKE ? LIMIT 3').all(`%${city}%`);

                if (hotels.length > 0) {
                    const hotelList = hotels.map(h => `- ${h.name} (₹${h.price}/night, ⭐${h.rating})`).join('\n');
                    responseText = `Here are some top hotels in ${city}:\n${hotelList}\n\nCheck the 'Hotels' page for more!`;
                } else {
                    responseText = `I couldn't find any hotels in ${city}. Try another city like Goa, Mumbai, or Jaipur.`;
                }
            } else {
                responseText = "I can help you find hotels! Just say 'hotels in Goa' or 'stay in Mumbai'.";
            }
        }

        // 2. Taxis Query
        else if (query.includes('taxi') || query.includes('cab') || query.includes('car')) {
            const cityMatch = query.match(/in\s+(\w+)/);
            if (cityMatch) {
                const city = cityMatch[1];
                const taxis = db.prepare('SELECT type, price_per_km FROM taxis WHERE city LIKE ? LIMIT 3').all(`%${city}%`);

                if (taxis.length > 0) {
                    const taxiList = taxis.map(t => `- ${t.type} (₹${t.price_per_km}/km)`).join('\n');
                    responseText = `We have these taxis available in ${city}:\n${taxiList}\n\nBook now on the 'Taxis' page!`;
                } else {
                    responseText = `I couldn't find taxi services in ${city} right now.`;
                }
            } else {
                responseText = "Need a ride? Ask me for 'taxis in Mumbai' or 'cabs in Delhi'.";
            }
        }

        // 3. Packages/Trips Query
        else if (query.includes('package') || query.includes('trip') || query.includes('tour')) {
            const destMatch = query.match(/(?:to|for|in)\s+(\w+)/);
            if (destMatch) {
                const dest = destMatch[1];
                const packages = db.prepare('SELECT title, price, duration FROM packages WHERE destination LIKE ? OR title LIKE ? LIMIT 3').all(`%${dest}%`, `%${dest}%`);

                if (packages.length > 0) {
                    const pkgList = packages.map(p => `- ${p.title} (${p.duration}, ₹${p.price})`).join('\n');
                    responseText = `Found these great packages for ${dest}:\n${pkgList}\n\nView details in 'Packages'!`;
                } else {
                    responseText = `No packages found specifically for ${dest} yet. Try 'Kerala', 'Manali', or 'Goa'.`;
                }
            } else {
                responseText = "Looking for a getaway? Ask for 'packages to Manali' or 'trip to Goa'.";
            }
        }

        // 4. General Weather (Mock - since no real weather API)
        else if (query.includes('weather')) {
            responseText = "For real-time weather, please use our 'Packing Assistant' feature! It gives live forecasts based on your destination.";
        }

        // 5. Offers
        else if (query.includes('offer') || query.includes('discount')) {
            responseText = "Head over to our 'Travel Offers' page! specific deals change daily, but you can find up to 20% off on select packages.";
        }

    } catch (error) {
        console.error('Chatbot Error:', error);
        responseText = "I'm having trouble connecting to my brain database right now. Please try again later.";
    }

    res.json({ response: responseText });
});

export default router;
