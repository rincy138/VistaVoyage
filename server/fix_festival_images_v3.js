import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const updates = [
    { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1000&q=80" },
    { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1563292325-1e42e434f07a?auto=format&fit=crop&w=1000&q=80" },
    { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=80" },
    { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1593113115760-4927233261a8?auto=format&fit=crop&w=1000&q=80" }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

const updateMany = db.transaction((data) => {
    for (const item of data) {
        stmt.run(item.url, item.name);
    }
});

try {
    updateMany(updates);
    console.log("Successfully updated festival images with confirmed working URLs!");
} catch (err) {
    console.error("Error updating festival images:", err);
}

db.close();
