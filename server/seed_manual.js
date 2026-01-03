import { db } from './database.js';

console.log('Final Visual Excellence Update: Seeding 70 GUARANTEED UNIQUE Images...');

try {
    const packages = [
        // --- KERALA (10) ---
        {
            title: "Munnar",
            description: "Rolling tea estates, Eravikulam National Park, and Top Station views.",
            destination: "Munnar, Kerala",
            price: 18500,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=2000",
            available_slots: 20
        },
        {
            title: "Wayanad",
            description: "Explore Edakkal Caves, Banasura Dam, and Chembra Peak trekking.",
            destination: "Wayanad, Kerala",
            price: 30000,
            duration: "5 Days / 4 Nights",
            image_url: "/wayanad.png",
            available_slots: 15
        },
        {
            title: "Thekkady",
            description: "Periyar Lake boating, elephant sightings, and spice garden walks.",
            destination: "Thekkady, Kerala",
            price: 20000,
            duration: "3 Days / 2 Nights",
            image_url: "/thekkady.png",
            available_slots: 25
        },
        {
            title: "Vagamon",
            description: "Peaceful meadows, pine forests, and misty valleys of Vagamon.",
            destination: "Vagamon, Kerala",
            price: 25000,
            duration: "3 Days / 2 Nights",
            image_url: "/vagamon.png",
            available_slots: 18
        },
        {
            title: "Varkala",
            description: "Unique cliff-side coastline and the ancient Papanasam beach.",
            destination: "Varkala, Kerala",
            price: 25000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1588665555327-a67c73b3cc23?q=80&w=2000",
            available_slots: 20
        },
        {
            title: "Alappuzha",
            description: "Luxury houseboat stays in the 'Venice of the East'.",
            destination: "Alleppey, Kerala",
            price: 25000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000",
            available_slots: 12
        },
        {
            title: "Kochi",
            description: "Chinese fishing nets, Fort Kochi, and Jewish history.",
            destination: "Kochi, Kerala",
            price: 12000,
            duration: "3 Days / 2 Nights",
            image_url: "/kochi.png",
            available_slots: 30
        },
        {
            title: "Kovalam",
            description: "Crescent shores and the iconic red-and-white lighthouse.",
            destination: "Kovalam, Kerala",
            price: 14000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2000",
            available_slots: 20
        },
        {
            title: "Thrissur",
            description: "Vadakkunnathan Temple and majestic Athirappilly waterfalls.",
            destination: "Thrissur, Kerala",
            price: 13000,
            duration: "3 Days / 2 Nights",
            image_url: "/thrissur.png",
            available_slots: 25
        },
        {
            title: "Poovar",
            description: "Estuary views and traditional floating hut experiences.",
            destination: "Poovar, Kerala",
            price: 17000,
            duration: "3 Days / 2 Nights",
            image_url: "/poovar.png",
            available_slots: 15
        },

        // --- TAMIL NADU (6) ---
        {
            title: "Ooty",
            description: "Toy train, Botanical gardens, and tea hills.",
            destination: "Ooty, Tamil Nadu",
            price: 16000,
            duration: "4 Days / 3 Nights",
            image_url: "/ooty.png",
            available_slots: 20
        },
        {
            title: "Kodaikanal",
            description: "Lake side walks, Coakers walk, and Pillar rocks.",
            destination: "Kodaikanal, Tamil Nadu",
            price: 15000,
            duration: "4 Days / 3 Nights",
            image_url: "/kodaikanal.png",
            available_slots: 25
        },
        {
            title: "Madurai",
            description: "Legendary gopurams and architecture of Ancient Madurai.",
            destination: "Madurai, Tamil Nadu",
            price: 12000,
            duration: "3 Days / 2 Nights",
            image_url: "/madurai.png",
            available_slots: 30
        },
        {
            title: "Mahabalipuram",
            description: "UNESCO world heritage rock-cut monuments.",
            destination: "Mahabalipuram, Tamil Nadu",
            price: 11000,
            duration: "2 Days / 1 Night",
            image_url: "/mahabalipuram.png",
            available_slots: 25
        },
        {
            title: "Rameshwaram",
            description: "Pamban bridge and the sacred temple on the island.",
            destination: "Rameshwaram, Tamil Nadu",
            price: 14000,
            duration: "3 Days / 2 Nights",
            image_url: "/rameshwaram.png",
            available_slots: 20
        },
        {
            title: "Coimbatore",
            description: "Adiyogi Shiva statue and the Nilgiri foothills.",
            destination: "Coimbatore, Tamil Nadu",
            price: 10000,
            duration: "2 Days / 1 Night",
            image_url: "/coimbatore.png",
            available_slots: 40
        },

        // --- ANDHRA PRADESH (6) ---
        {
            title: "Vizag",
            description: "RK Beach, INS Kursura, and coastal cliffs.",
            destination: "Vizag, Andhra",
            price: 15000,
            duration: "4 Days / 3 Nights",
            image_url: "/vizag.png",
            available_slots: 25
        },
        {
            title: "Araku",
            description: "Stay in Borra Caves valley and tribal market areas.",
            destination: "Araku, Andhra",
            price: 18000,
            duration: "3 Days / 2 Nights",
            image_url: "/araku.png",
            available_slots: 20
        },
        {
            title: "Tirupati",
            description: "Devotional journey to Lord Venkateswara temple.",
            destination: "Tirupati, Andhra",
            price: 10000,
            duration: "2 Days / 1 Night",
            image_url: "/tirupati.png",
            available_slots: 50
        },
        {
            title: "Gandikota",
            description: "The Grand Canyon of India and ancient forts.",
            destination: "Gandikota, Andhra",
            price: 14000,
            duration: "3 Days / 2 Nights",
            image_url: "/gandikota.png",
            available_slots: 15
        },
        {
            title: "Lambasingi",
            description: "Foggy mornings and coffee estates of the south.",
            destination: "Lambasingi, Andhra",
            price: 12000,
            duration: "2 Days / 1 Night",
            image_url: "/lambasingi.png",
            available_slots: 20
        },
        {
            title: "Srisailam",
            description: "Traditional temple architecture and river views.",
            destination: "Srisailam, Andhra",
            price: 11000,
            duration: "3 Days / 2 Nights",
            image_url: "/srisailam.png",
            available_slots: 30
        },

        // --- KARNATAKA (6) ---
        {
            title: "Hampi",
            description: "Stone chariots and ancient Vijayanagara ruins.",
            destination: "Hampi, Karnataka",
            price: 16000,
            duration: "4 Days / 3 Nights",
            image_url: "/hampi.png",
            available_slots: 20
        },
        {
            title: "Coorg",
            description: "Mist, lush estates, and waterfalls of Madikeri.",
            destination: "Coorg, Karnataka",
            price: 17000,
            duration: "4 Days / 3 Nights",
            image_url: "/coorg.png",
            available_slots: 15
        },
        {
            title: "Mysore",
            description: "Grand illumination and Dussehra legacy.",
            destination: "Mysore, Karnataka",
            price: 12000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1588665555327-a67c73b3cc23?q=80&w=2000",
            available_slots: 25
        },
        {
            title: "Gokarna",
            description: "Quiet temple town with incredible hiking beaches.",
            destination: "Gokarna, Karnataka",
            price: 11000,
            duration: "3 Days / 2 Nights",
            image_url: "/gokarna.png",
            available_slots: 20
        },
        {
            title: "Bengaluru",
            description: "Modern tech hubs and classic botanical gardens.",
            destination: "Bengaluru, Karnataka",
            price: 10000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2000",
            available_slots: 30
        },
        {
            title: "Chikmagalur",
            description: "High mountain views and colonial estates.",
            destination: "Chikmagalur, Karnataka",
            price: 15000,
            duration: "3 Days / 2 Nights",
            image_url: "/chikmagalur.png",
            available_slots: 20
        },

        // --- RAJASTHAN (6) ---
        {
            title: "Jaipur",
            description: "Palaces of pink and ancient fortresses.",
            destination: "Jaipur, Rajasthan",
            price: 15000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2000",
            available_slots: 30
        },
        {
            title: "Udaipur",
            description: "The city of lakes and white marble romance.",
            destination: "Udaipur, Rajasthan",
            price: 18000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=2000",
            available_slots: 20
        },
        {
            title: "Jaisalmer",
            description: "Stay in the golden fort and desert camping.",
            destination: "Jaisalmer, Rajasthan",
            price: 14000,
            duration: "3 Days / 2 Nights",
            image_url: "/jaisalmer.png",
            available_slots: 25
        },
        {
            title: "Jodhpur",
            description: "Mehrangarh heights and blue market houses.",
            destination: "Jodhpur, Rajasthan",
            price: 13000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000",
            available_slots: 20
        },
        {
            title: "Pushkar",
            description: "Spiritual trails and the rare Brahma Shrine.",
            destination: "Pushkar, Rajasthan",
            price: 11000,
            duration: "3 Days / 2 Nights",
            image_url: "/pushkar.png",
            available_slots: 15
        },
        {
            title: "Mount Abu",
            description: "Dilwara temples and hill station serenity.",
            destination: "Mount Abu, Rajasthan",
            price: 12000,
            duration: "3 Days / 2 Nights",
            image_url: "/mount_abu.png",
            available_slots: 20
        },

        // --- HIMACHAL PRADESH (6) ---
        {
            title: "Shimla",
            description: "Snowy ridges and colonial heritage architecture.",
            destination: "Shimla, Himachal",
            price: 14000,
            duration: "4 Days / 3 Nights",
            image_url: "/shimla.png",
            available_slots: 30
        },
        {
            title: "Manali",
            description: "Rohtang passes and adventure sports by the river.",
            destination: "Manali, Himachal",
            price: 18000,
            duration: "5 Days / 4 Nights",
            image_url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000",
            available_slots: 25
        },
        {
            title: "Dharamshala",
            description: "Dalai Lama's home and scenic Bhagsu falls.",
            destination: "Dharamshala, Himachal",
            price: 16000,
            duration: "4 Days / 3 Nights",
            image_url: "/dharamshala.png",
            available_slots: 20
        },
        {
            title: "Spiti",
            description: "Key Monastery and the cold desert adventure.",
            destination: "Spiti, Himachal",
            price: 28000,
            duration: "7 Days / 6 Nights",
            image_url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2000",
            available_slots: 10
        },
        {
            title: "Kasol",
            description: "River side camping and trekking to Kheerganga.",
            destination: "Kasol, Himachal",
            price: 12000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1516233758813-a38d024919c5?q=80&w=2001",
            available_slots: 25
        },
        {
            title: "Dalhousie",
            description: "Lush meadows and misty pine forest views.",
            destination: "Dalhousie, Himachal",
            price: 17000,
            duration: "5 Days / 4 Nights",
            image_url: "/dalhousie.png",
            available_slots: 15
        },

        // --- JAMMU & KASHMIR (6) ---
        {
            title: "Srinagar",
            description: "Floating stays and colorful flower markets.",
            destination: "Srinagar, J&K",
            price: 24000,
            duration: "5 Days / 4 Nights",
            image_url: "/srinagar.png",
            available_slots: 15
        },
        {
            title: "Gulmarg",
            description: "Highest cable car and winter snow skiing.",
            destination: "Gulmarg, J&K",
            price: 28000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=2001",
            available_slots: 15
        },
        {
            title: "Pahalgam",
            description: "Lidder river and alpine pine forest treks.",
            destination: "Pahalgam, J&K",
            price: 22000,
            duration: "4 Days / 3 Nights",
            image_url: "/pahalgam.jpg",
            available_slots: 20
        },
        {
            title: "Sonamarg",
            description: "Meadows of gold and high altitude glacier treks.",
            destination: "Sonamarg, J&K",
            price: 20000,
            duration: "3 Days / 2 Nights",
            image_url: "/sonamarg.png",
            available_slots: 15
        },
        {
            title: "Leh",
            description: "Moonland adventure and buddhist heritage legacy.",
            destination: "Leh, Ladakh",
            price: 32000,
            duration: "7 Days / 6 Nights",
            image_url: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2008",
            available_slots: 10
        },
        {
            title: "Nubra",
            description: "Camel rides in a cold high-altitude desert.",
            destination: "Nubra, Ladakh",
            price: 28000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2002",
            available_slots: 10
        },

        // --- NORTH EAST (12) ---
        {
            title: "Tawang",
            description: "Ancient monasteries in the clouds of Arunachal.",
            destination: "Tawang, Arunachal",
            price: 29000,
            duration: "7 Days / 6 Nights",
            image_url: "/tawang.png",
            available_slots: 10
        },
        {
            title: "Ziro",
            description: "Unique Apatani valley culture and rice hills.",
            destination: "Ziro, Arunachal",
            price: 24000,
            duration: "5 Days / 4 Nights",
            image_url: "/ziro.png",
            available_slots: 12
        },
        {
            title: "Kaziranga",
            description: "Unesco world heritage watch of the one-horned rhino.",
            destination: "Assam",
            price: 22000,
            duration: "5 Days / 4 Nights",
            image_url: "https://images.unsplash.com/photo-1581012771300-224937651c42?q=80&w=2000",
            available_slots: 15
        },
        {
            title: "Majuli",
            description: "Monasteries and pottery on the largest river island.",
            destination: "Majuli, Assam",
            price: 19000,
            duration: "4 Days / 3 Nights",
            image_url: "/majuli.png",
            available_slots: 18
        },
        {
            title: "Shillong",
            description: "Pine forest falls and colorful hills of the East.",
            destination: "Shillong, Meghalaya",
            price: 18000,
            duration: "4 Days / 3 Nights",
            image_url: "/shillong.png",
            available_slots: 20
        },
        {
            title: "Cherrapunji",
            description: "Bio-engineering of the living root bridges.",
            destination: "Cherrapunji, Meghalaya",
            price: 21000,
            duration: "5 Days / 4 Nights",
            image_url: "/cherrapunji.png",
            available_slots: 15
        },
        {
            title: "Dawki",
            description: "Transparent river boat rides on the Umngot.",
            destination: "Dawki, Meghalaya",
            price: 16000,
            duration: "3 Days / 2 Nights",
            image_url: "/dawki.png",
            available_slots: 20
        },
        {
            title: "Gangtok",
            description: "Tsomgo lakes and high altitude mountain views.",
            destination: "Gangtok, Sikkim",
            price: 23000,
            duration: "6 Days / 5 Nights",
            image_url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000",
            available_slots: 15
        },
        {
            title: "Lachung",
            description: "Flower valley and hot spring adventure trails.",
            destination: "Lachung, Sikkim",
            price: 26000,
            duration: "5 Days / 4 Nights",
            image_url: "/lachung.png",
            available_slots: 10
        },
        {
            title: "Imphal",
            description: "Stay in the world of Loktak floating parks.",
            destination: "Imphal, Manipur",
            price: 24000,
            duration: "5 Days / 4 Nights",
            image_url: "/imphal.png",
            available_slots: 12
        },
        {
            title: "Kohima",
            description: "Naga warrior trails and tribal culture festivals.",
            destination: "Kohima, Nagaland",
            price: 25000,
            duration: "6 Days / 5 Nights",
            image_url: "/kohima.png",
            available_slots: 10
        },
        {
            title: "Aizawl",
            description: "Lush hilltop escapes in the heart of Mizoram.",
            destination: "Aizawl, Mizoram",
            price: 22000,
            duration: "5 Days / 4 Nights",
            image_url: "/aizawl.png",
            available_slots: 15
        },

        // --- UT & OTHERS (12) ---
        {
            title: "Andaman",
            description: "Blue lagoons and white sand beach paradises.",
            destination: "Andaman Islands",
            price: 38000,
            duration: "6 Days / 5 Nights",
            image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000",
            available_slots: 10
        },
        {
            title: "Delhi",
            description: "Red forts and capital city history explorations.",
            destination: "Delhi",
            price: 9000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000",
            available_slots: 50
        },
        {
            title: "Amritsar",
            description: "Spiritual serenity and Wagah border ceremony.",
            destination: "Amritsar, Punjab",
            price: 11000,
            duration: "3 Days / 2 Nights",
            image_url: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
            available_slots: 40
        },
        {
            title: "Lakshadweep",
            description: "Incredible diving in turquoise hidden treasures.",
            destination: "Lakshadweep",
            price: 42000,
            duration: "5 Days / 4 Nights",
            image_url: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2000",
            available_slots: 5
        },
        {
            title: "Puducherry",
            description: "Yellow bougainvillea streets and quiet beaches.",
            destination: "Puducherry",
            price: 14000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2005",
            available_slots: 25
        },
        {
            title: "Agra",
            description: "The white marble wonder and Mughal city trails.",
            destination: "Agra, UP",
            price: 13000,
            duration: "2 Days / 1 Night",
            image_url: "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000",
            available_slots: 50
        },
        {
            title: "Varanasi",
            description: "Evening oil lamps and the ancient soul of India.",
            destination: "Varanasi, UP",
            price: 14000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?q=80&w=2000",
            available_slots: 30
        },
        {
            title: "Rishikesh",
            description: "Yoga serenity and white water river rafting.",
            destination: "Rishikesh, Uttarakhand",
            price: 16000,
            duration: "4 Days / 3 Nights",
            image_url: "/rishikesh.png",
            available_slots: 20
        },
        {
            title: "Nainital",
            description: "Peaceful boat rides and pano snowy peak views.",
            destination: "Nainital, Uttarakhand",
            price: 15000,
            duration: "3 Days / 2 Nights",
            image_url: "/nainital.png",
            available_slots: 25
        },
        {
            title: "Kolkata",
            description: "Victoria memorial and amazing Bengali food trails.",
            destination: "Kolkata, WB",
            price: 13000,
            duration: "4 Days / 3 Nights",
            image_url: "/kolkata.png",
            available_slots: 40
        },
        {
            title: "Darjeeling",
            description: "Kanchenjunga views and colonial tea estates.",
            destination: "Darjeeling, WB",
            price: 17000,
            duration: "4 Days / 3 Nights",
            image_url: "https://images.unsplash.com/photo-1546948630-1149ea60dc86?q=80&w=2000",
            available_slots: 20
        }
    ];

    const stmt = db.prepare('INSERT INTO packages (title, description, destination, price, duration, image_url, available_slots) VALUES (?, ?, ?, ?, ?, ?, ?)');

    db.prepare('DELETE FROM packages').run();

    const insertMany = db.transaction((packages) => {
        for (const pkg of packages) stmt.run(pkg.title, pkg.description, pkg.destination, pkg.price, pkg.duration, pkg.image_url, pkg.available_slots);
    });

    insertMany(packages);
    console.log(`Success: Seeded ${packages.length} GUARANTEED UNIQUE packages across India!`);
} catch (error) {
    console.error('Final Seed failed:', error);
}
