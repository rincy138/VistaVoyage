import fs from 'fs';
import path from 'path';

const filePath = 'server/destinations_data.js';
let content = fs.readFileSync(filePath, 'utf8');

const mapping = {
    "Munnar": "/munnar.png",
    "Wayanad": "/wayanad.png",
    "Thekkady": "/thekkady.png",
    "Vagamon": "/vagamon.png",
    "Varkala": "https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=2000",
    "Alappuzha": "/alleppey.png",
    "Kochi": "/kochi.png",
    "Kovalam": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2000",
    "Thrissur": "/thrissur.png",
    "Poovar": "/poovar.png",
    "Ooty": "/ooty.png",
    "Kodaikanal": "/kodaikanal.png",
    "Madurai": "/madurai.png",
    "Mahabalipuram": "/mahabalipuram.png",
    "Rameshwaram": "/rameshwaram.png",
    "Coimbatore": "/coimbatore.png",
    "Vizag": "/vizag.png",
    "Araku": "/araku.png",
    "Tirupati": "/tirupati.png",
    "Gandikota": "/gandikota.png",
    "Lambasingi": "/lambasingi.png",
    "Srisailam": "/srisailam.png",
    "Hampi": "/hampi.png",
    "Coorg": "/coorg.png",
    "Mysore": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2000",
    "Gokarna": "/gokarna.png",
    "Bengaluru": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=2000",
    "Chikmagalur": "/chikmagalur.png",
    "Jaipur": "/jaipur.png",
    "Udaipur": "/udaipur.png",
    "Jaisalmer": "/jaisalmer.png",
    "Jodhpur": "/jodhpur.png",
    "Pushkar": "/pushkar.png",
    "Mount Abu": "/mount_abu.png",
    "Shimla": "/shimla.png",
    "Manali": "/manali.png",
    "Dharamshala": "/dharamshala.png",
    "Spiti": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2000",
    "Kasol": "https://images.unsplash.com/photo-1516233758813-a38d024919c5?q=80&w=2001",
    "Dalhousie": "/dalhousie.png",
    "Srinagar": "/srinagar.png",
    "Gulmarg": "https://images.unsplash.com/photo-1620332372374-f108c53d2e03?q=80&w=2001",
    "Pahalgam": "/pahalgam.jpg",
    "Sonamarg": "/sonamarg.png",
    "Leh": "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=2008",
    "Nubra": "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2002",
    "Tawang": "/tawang.png",
    "Ziro": "/ziro.png",
    "Kaziranga": "/kaziranga.png",
    "Majuli": "/majuli.png",
    "Shillong": "/shillong.png",
    "Cherrapunji": "/cherrapunji.png",
    "Dawki": "/dawki.png",
    "Gangtok": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000",
    "Lachung": "/lachung.png",
    "Imphal": "/imphal.png",
    "Kohima": "/kohima.png",
    "Aizawl": "/aizawl.png",
    "Andaman": "/andaman.png",
    "Delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2000",
    "Amritsar": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
    "Lakshadweep": "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=2000",
    "Puducherry": "/pondicherry.png",
    "Agra": "/agra.png",
    "Varanasi": "/varanasi.png",
    "Rishikesh": "/rishikesh.png",
    "Nainital": "/nainital.png",
    "Kolkata": "/kolkata.png",
    "Darjeeling": "https://images.unsplash.com/photo-1546948630-1149ea60dc86?q=80&w=2000",
    "Goa Beach Retreat": "/goa.png"
};

for (const [title, path] of Object.entries(mapping)) {
    const regex = new RegExp(`(title:\\s*"${title}",[\\s\\S]*?image_url:\\s*)"[^"]*"`, 'g');
    content = content.replace(regex, `$1"${path}"`);
}

fs.writeFileSync(filePath, content);
console.log('Updated destinations_data.js with local paths.');
