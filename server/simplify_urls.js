import Database from 'better-sqlite3';

const db = new Database('server/data/vistavoyage.db');

const data = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?w=800" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?w=800" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?w=800" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?w=800" },
    { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800" }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

db.transaction(() => {
    for (const f of data) {
        stmt.run(f.url, f.name);
        console.log(`Updated ${f.name} with simplified URL`);
    }
})();

console.log('Done.');
db.close();
