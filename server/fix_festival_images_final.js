import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const updates = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1590766944548-d218290bfc8b?auto=format&fit=crop&w=800&q=80" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1523731407965-243ffecaa080?auto=format&fit=crop&w=800&q=80" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1590765610237-9dec8377be83?auto=format&fit=crop&w=800&q=80" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1626014303757-611634b07fb5?auto=format&fit=crop&w=800&q=80" },
    { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80" }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

const updateMany = db.transaction((data) => {
    for (const item of data) {
        stmt.run(item.url, item.name);
    }
});

try {
    updateMany(updates);
    console.log("Successfully updated festival images with verified IDs!");
} catch (err) {
    console.error("Error updating festival images:", err);
}

db.close();
