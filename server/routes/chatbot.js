import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Helper to extract city from query
const extractCity = (query) => {
    // Look for patterns like "in Goa", "at Manali", "near Mumbai"
    const inMatch = query.match(/(?:in|at|near|for|to|of)\s+([a-zA-Z\s]+)/);
    let cityCandidate = null;

    if (inMatch) {
        cityCandidate = inMatch[1].replace(/\b(hotels?|taxis?|cabs?|packages?|trips?|tours?|stays?|rooms?|resorts?)\b/gi, '').trim();
    }

    // Check for common cities if no "in" pattern or as verification
    const commonCities = [
        'munnar', 'goa', 'wayanad', 'manali', 'ladakh', 'leh', 'srinagar', 'coorg',
        'jaipur', 'varanasi', 'udaipur', 'mumbai', 'delhi', 'rishikesh', 'andaman',
        'agra', 'shimla', 'jodhpur', 'alleppey', 'kochi', 'kerala', 'kashmir',
        'pushkar', 'sonepur', 'kutch', 'kohima', 'faridabad'
    ];

    // If we have a candidate, check if it contains any of our known cities
    if (cityCandidate) {
        for (const city of commonCities) {
            if (cityCandidate.toLowerCase().includes(city)) return city;
        }
        return cityCandidate.split(' ')[0]; // Return the first word if not matched
    }

    for (const city of commonCities) {
        if (query.includes(city)) return city;
    }

    return null;
};

// Travel Knowledge Base (Static for Demo)
const travelTips = {
    'munnar': { bestTime: 'September to March', vibe: 'Mist-covered tea gardens and serene mountains.' },
    'goa': { bestTime: 'November to February', vibe: 'Sun-soaked beaches and vibrant nightlife.' },
    'manali': { bestTime: 'March to June (Adventure) or Dec to Feb (Snow)', vibe: 'Snow-capped peaks and river adventures.' },
    'varanasi': { bestTime: 'October to March', vibe: 'Spiritual awakening and ancient traditions.' },
    'jaipur': { bestTime: 'October to March', vibe: 'Royal heritage and magnificent forts.' },
    'udaipur': { bestTime: 'September to March', vibe: 'Romantic lakes and royal palaces.' },
    'kerala': { bestTime: 'September to March', vibe: 'Backwaters, houseboats, and lush greenery.' }
};

router.post('/message', (req, res) => {
    const { message } = req.body;
    console.log('[Chatbot] Received message:', message);

    let responseText = "I'm here to help! 🌎 I can find you the best **Hotels**, **Taxis**, or **Holiday Packages**. Try asking something like 'Tell me about hotels in Goa' or 'I want an adventure trip'.";

    if (!message) {
        return res.json({ response: responseText });
    }

    const query = message.toLowerCase();

    try {
        // 0. Greetings & Small Talk
        if (query.match(/\b(hi|hello|hey|greetings|sup|yo|hola|namaste|morning|evening)\b/)) {
            responseText = "Hello there! 👋 I'm **Vista**, your personal travel assistant. I'm ready to help you plan your dream vacation. \n\nWhat are you looking for today?\n\n🏨 **Hotels** in specific cities\n🚖 **Reliable Taxis**\n🌴 **Curated Tour Packages**\n🏔️ **Adventure & Sightseeing**";
        }
        else if (query.includes('how are you') || query.includes('hows it going')) {
            responseText = "I'm doing fantastic, thank you! 😊 Just busy indexing all the beautiful destinations in India. How about you? Ready to plan your next escape?";
        }

        // 1. Identity / Who are you
        else if (query.includes('who are you') || query.includes('your name') || query.includes('what are you') || query.includes('who is vista') || query.includes('identity')) {
            responseText = "I'm **Vista**, your AI travel companion! 🤖 I'm here to find you the best stays, taxis, and tour packages across India. Think of me as your personal concierge for everything VistaVoyage. How can I help you today?";
        }

        // 2. Festivals / Mela Queries
        else if (query.includes('festival') || query.includes('mela') || query.includes('fair') || query.includes('event') || query.includes('tracker') || query.includes('cultural')) {
            const city = extractCity(query);
            let results = [];
            if (city) {
                results = db.prepare('SELECT name, location, start_date, description FROM festivals WHERE location LIKE ? OR name LIKE ?').all(`%${city}%`, `%${city}%`);
            } else {
                results = db.prepare('SELECT name, location, start_date, description FROM festivals LIMIT 3').all();
            }

            if (results.length > 0) {
                const festList = results.map(f => `✨ **${f.name}**\n   📍 ${f.location}\n   📅 Starts: ${new Date(f.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n   _${f.description.substring(0, 100)}..._`).join('\n\n');
                responseText = `India is vibrant with cultural events! Here's what I found in our calendar:\n\n${festList}\n\nDon't forget to check our **Mela Tracker** for the full schedule! 🎡`;
            } else {
                responseText = "I'm still gathering details on that specific event, but we have some amazing ones listed in our **Mela Tracker**, including the **Pushkar Camel Fair** and **Hornbill Festival**! 📅";
            }
        }

        // 3. Hotels Query
        else if (query.includes('hotel') || query.includes('stay') || query.includes('room') || query.includes('resort') || query.includes('accommodation') || query.includes('lodging')) {
            const city = extractCity(query);

            if (city) {
                const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
                // Search hotels - increased limit to 4 for better variety
                const hotels = db.prepare('SELECT name, price, rating FROM hotels WHERE city LIKE ? OR location LIKE ? LIMIT 4').all(`%${city}%`, `%${city}%`);

                if (hotels.length > 0) {
                    const hotelList = hotels.map(h => `🏨 **${h.name}**\n   (₹${h.price}/night • ⭐${h.rating})`).join('\n\n');
                    responseText = `I found these top-rated stays in **${displayCity}** for you:\n\n${hotelList}\n\n✨ You can view more choices and amenities on our **Hotels** page!`;
                } else {
                    responseText = `I couldn't find any specific hotels in **${displayCity}** right now. However, we have several **Packages** that include accommodation there. Would you like to see them?`;
                }
            } else {
                responseText = "I'd love to find some hotels for you! 🏨 Could you please specify which city? (e.g., 'hotels in Munnar')";
            }
        }

        // 4. Taxis Query
        else if (query.includes('taxi') || query.includes('cab') || query.includes('car') || query.includes('ride') || query.includes('transfer') || query.includes('driver')) {
            const city = extractCity(query);

            if (city) {
                const displayCity = city.charAt(0).toUpperCase() + city.slice(1);
                const taxis = db.prepare('SELECT type, price_per_km, capacity FROM taxis WHERE city LIKE ? LIMIT 3').all(`%${city}%`);

                if (taxis.length > 0) {
                    const taxiList = taxis.map(t => `🚖 **${t.type}**\n   (₹${t.price_per_km}/km • ${t.capacity})`).join('\n\n');
                    responseText = `Available rides in **${displayCity}**:\n\n${taxiList}\n\n📍 Visit the **Taxis** page to book your transfer directly!`;
                } else {
                    responseText = `We currently don't have local taxi listings for **${displayCity}** in our system, but we can arrange a private transfer as part of a package!`;
                }
            } else {
                responseText = "Need a ride? 🚖 Just let me know which city you need a taxi in, and I'll check our local fleet for you.";
            }
        }

        // 5. Packages/Trips Query
        else if (query.includes('package') || query.includes('trip') || query.includes('tour') || query.includes('vacation') || query.includes('relax') || query.includes('adventure') || query.includes('weekend') || query.includes('honeymoon') || query.includes('offer') || query.includes('deal') || query.includes('destination') || query.includes('place')) {

            let moodLike = '%';
            if (query.includes('relax')) moodLike = '%relax%';
            if (query.includes('adventure') || query.includes('trek') || query.includes('mountain')) moodLike = '%adventure%';
            if (query.includes('beach')) moodLike = '%beach%';
            if (query.includes('spiritual') || query.includes('temple')) moodLike = '%spiritual%';
            if (query.includes('honeymoon') || query.includes('romantic')) moodLike = '%romantic%';

            const city = extractCity(query);

            let packages = [];
            if (city) {
                packages = db.prepare('SELECT title, price, duration FROM packages WHERE destination LIKE ? OR title LIKE ? LIMIT 3').all(`%${city}%`, `%${city}%`);
            } else if (moodLike !== '%') {
                packages = db.prepare('SELECT title, price, duration FROM packages WHERE mood_tags LIKE ? OR description LIKE ? LIMIT 3').all(moodLike, moodLike);
            } else {
                // Return popular ones with high price for premium feel
                packages = db.prepare('SELECT title, price, duration FROM packages ORDER BY price DESC LIMIT 3').all();
            }

            if (packages.length > 0) {
                const pkgList = packages.map(p => `🌴 **${p.title}**\n   (${p.duration} • ₹${p.price})`).join('\n\n');
                if (city) {
                    responseText = `Check out these curated packages for **${city.charAt(0).toUpperCase() + city.slice(1)}**:\n\n${pkgList}\n\n🎒 Full details and booking options are available on the **Packages** page!`;
                } else {
                    responseText = `I've selected these experiences based on your travel style:\n\n${pkgList}\n\n✨ Browse all our holiday deals on the **Packages** page.`;
                }
            } else {
                responseText = "We have many exciting packages! 🎒 Try searching for destinations like 'Kerala', 'Himachal', or 'Andaman' to see what we offer.";
            }
        }

        // 6. Best time to visit / Weather Queries
        else if (query.includes('when') || query.includes('time to visit') || query.includes('best time') || query.includes('weather')) {
            const city = extractCity(query);
            if (city && travelTips[city.toLowerCase()]) {
                const info = travelTips[city.toLowerCase()];
                responseText = `The best time to visit **${city.charAt(0).toUpperCase() + city.slice(1)}** is generally **${info.bestTime}**. \n\nYou'll experience ${info.vibe} \n\nWould you like me to find some packages for those dates?`;
            } else if (city) {
                responseText = `For **${city.charAt(0).toUpperCase() + city.slice(1)}**, major tourist seasons are usually around October to March. Would you like me to find some hotels for you?`;
            } else {
                responseText = "Which destination are you wondering about? Ask me something like 'When is the best time to visit Goa?'";
            }
        }

        // 7. 💰 Budget Queries
        else if (query.includes('price') || query.includes('cost') || query.includes('budget') || query.includes('expensive') || query.includes('cheap') || query.includes('how much')) {
            const city = extractCity(query);
            if (city) {
                const minPrice = db.prepare('SELECT MIN(price) as min FROM packages WHERE destination LIKE ?').get(`%${city}%`).min;
                const avgHotel = db.prepare('SELECT AVG(price) as avg FROM hotels WHERE city LIKE ?').get(`%${city}%`).avg;

                if (minPrice) {
                    responseText = `A trip to **${city.charAt(0).toUpperCase() + city.slice(1)}** usually starts from around **₹${minPrice}** per person. \n\nHotels in the area average around **₹${Math.round(avgHotel || 0)}** per night. \n\nWould you like me to show you our most affordable packages?`;
                } else {
                    responseText = `Prices for **${city}** vary by season, but hotels typically start from ₹2,000 to ₹5,000 depending on the luxury level.`;
                }
            } else {
                responseText = "I can give you estimate costs for trips! Which city or package are you interested in?";
            }
        }

        // 8. General City Lookup (if city found but no intent)
        else if (extractCity(query)) {
            const city = extractCity(query);
            const displayCity = city.charAt(0).toUpperCase() + city.slice(1);

            const hotelCount = db.prepare('SELECT COUNT(*) as count FROM hotels WHERE city LIKE ?').get(`%${city}%`).count;
            const packageCount = db.prepare('SELECT COUNT(*) as count FROM packages WHERE destination LIKE ?').get(`%${city}%`).count;

            responseText = `Ah, **${displayCity}**! A beautiful choice. 🏔️\n\nI can help you find ${hotelCount} hotels there, or we have ${packageCount} holiday packages available.\n\nWhat would you like to see first?`;
        }

        // 9. Gratitude / Social
        else if (query.match(/\b(thank|thx|thanks|nice|great|good|awesome|amazing|wow)\b/)) {
            responseText = "You're very welcome! 😊 My goal is to make your travel planning as smooth as possible. \n\nReady to book something, or still exploring?";
        }

        // 10. Help / Capabilities
        else if (query.includes('help') || query.includes('what can you do') || query.includes('can you help') || query.includes('commands') || query.includes('how to use')) {
            responseText = "I'm your travel buddy! ✈️ I can help you with:\n\n1. 🏨 **Hotels** - 'hotels in Varanasi'\n2. 🚖 **Taxis** - 'taxi in Manali'\n3. 🌴 **Packages** - 'adventure packages'\n4. 🎡 **Festivals** - 'upcoming melas'\n5. 📅 **Best Time** - 'when to visit Munnar?'\n6. 💰 **Budget** - 'how much for a Goa trip?'\n\nWhat would you like to explore?";
        }

        // 11. Error handling fallback for unrecognized
        else {
            responseText = "That's a great question! 🌎 While I'm still learning about every corner of the world, I'm an expert on **Hotels**, **Taxis**, **Tour Packages**, and **Cultural Festivals** in India. \n\nTry asking 'Tell me about hotels in Goa' or 'What festivals are coming up?'";
        }

    } catch (error) {
        console.error('Chatbot Error:', error);
        responseText = "I hit a small snag while searching my travel books! 📚 Please try again in a moment.";
    }

    res.json({ response: responseText });
});

export default router;

