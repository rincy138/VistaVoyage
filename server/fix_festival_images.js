import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const updates = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1590766345639-653457f5f9cf" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5" },
    { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739" }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

const updateMany = db.transaction((data) => {
    for (const item of data) {
        stmt.run(item.url, item.name);
    }
});

try {
    updateMany(updates);
    console.log("Successfully updated festival images!");
} catch (err) {
    console.error("Error updating festival images:", err);
}

db.close();
