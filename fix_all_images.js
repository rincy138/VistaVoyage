
import { db } from './server/database.js';

const imageMap = {
    "Munnar": "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?q=80&w=2000",
    "Wayanad": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2000",
    "Thekkady": "https://images.unsplash.com/photo-1589136140230-67e1d8476443?q=80&w=2000",
    "Alleppey": "https://images.unsplash.com/photo-1593693397690-362ae9666ec2?q=80&w=2000",
    "Kochi": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=2000",
    "Goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000",
    "Jaipur": "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2000",
    "Udaipur": "https://images.unsplash.com/photo-1549463387-92c21a1d1235?q=80&w=2000",
    "Varanasi": "https://images.unsplash.com/photo-1561224737-268153600bef?q=80&w=2000",
    "Manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000",
    "Srinagar": "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000",
    "Leh Ladakh": "https://images.unsplash.com/photo-1594220551065-9f9fa9bd36d9?q=80&w=2000",
    "Shimla": "https://images.unsplash.com/photo-1597074866923-dc0589150358?q=80&w=2000",
    "Agra": "https://images.unsplash.com/photo-1564507592333-c60657451dd6?q=80&w=2000",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-1cd12e429fd5?q=80&w=2000",
    "Mumbai": "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?q=80&w=2000",
    "Hampi": "https://images.unsplash.com/photo-1600100395420-40aa0c649511?q=80&w=2000",
    "Mysore": "https://images.unsplash.com/photo-1590766940554-634a7ed41450?q=80&w=2000",
    "Pondicherry": "https://images.unsplash.com/photo-1590050752117-233cb03b298c?q=80&w=2000",
    "Ooty": "https://images.unsplash.com/photo-1590424748152-094396901867?q=80&w=2000",
    "Coorg": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000",
    "Kovalam": "https://images.unsplash.com/photo-1589578112520-21a7a030799a?q=80&w=2000",
    "Kochi": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=2000",
    "Rishikesh": "https://images.unsplash.com/photo-1598977123418-45005523f323?q=80&w=2000",
    "Haridwar": "https://images.unsplash.com/photo-1590492471926-d62f6b866509?q=80&w=2000",
    "Gokarna": "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?q=80&w=2000",
    "Jodhpur": "https://images.unsplash.com/photo-1590492471926-d62f6b866509?q=80&w=2000",
    "Jaisalmer": "https://images.unsplash.com/photo-1536413233810-7f287e0767cb?q=80&w=2000",
    "Pushkar": "https://images.unsplash.com/photo-1589136140230-67e1d8476443?q=80&w=2000"
};

const defaultImages = [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=2000",
    "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000",
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2000",
    "https://images.unsplash.com/photo-1496372412473-e8548ffd82bc?q=80&w=2000"
];

const updateRecords = () => {
    // Update Destinations
    const dests = db.prepare("SELECT * FROM destinations").all();
    let dCount = 0;
    dests.forEach(d => {
        if (!d.image_url || d.image_url.startsWith('/') || !d.image_url.startsWith('http')) {
            const newImg = imageMap[d.destination_name] || imageMap[d.destination_name.split(' ')[0]] || defaultImages[d.destination_id % defaultImages.length];
            db.prepare("UPDATE destinations SET image_url = ? WHERE destination_id = ?").run(newImg, d.destination_id);
            dCount++;
        }
    });

    // Update Packages
    const pkgs = db.prepare("SELECT * FROM packages").all();
    let pCount = 0;
    pkgs.forEach(p => {
        if (!p.image_url || p.image_url.startsWith('/') || !p.image_url.startsWith('http')) {
            const newImg = imageMap[p.title] || imageMap[p.destination] || imageMap[p.title.split(' ')[0]] || defaultImages[p.id % defaultImages.length];
            db.prepare("UPDATE packages SET image_url = ? WHERE id = ?").run(newImg, p.id);
            pCount++;
        }
    });

    console.log(`Updated ${dCount} destinations and ${pCount} packages with high-quality images.`);
};

updateRecords();
