import Database from 'better-sqlite3';

const db = new Database('server/data/vistavoyage.db');

const data = [
    { name: "Pushkar Camel Fair", url: "/pushkar.png" },
    { name: "Sonepur Mela", url: "/varanasi.png" }, // Using Varanasi as a cultural match
    { name: "Rann Utsav", url: "/jaisalmer.png" }, // Using Jaisalmer as a desert match
    { name: "Hornbill Festival", url: "/kohima.png" },
    { name: "Surajkund International Crafts Mela", url: "/jaipur.png" } // Using Jaipur as a crafts match
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

db.transaction(() => {
    for (const f of data) {
        stmt.run(f.url, f.name);
        console.log(`Updated ${f.name} with local image ${f.url}`);
    }
})();

console.log('Done.');
db.close();
