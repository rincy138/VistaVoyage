import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

try {
    // SQLite doesn't directly support changing column types easily, 
    // but VARCHAR(255) to TEXT is usually just a metadata change or doesn't even matter in SQLite.
    // However, I'll re-seed the data with verified clean URLs.

    const updates = [
        { name: "Pushkar Camel Fair", url: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1000&q=80" },
        { name: "Sonepur Mela", url: "https://images.unsplash.com/photo-1563292325-1e42e434f07a?auto=format&fit=crop&w=1000&q=80" },
        { name: "Rann Utsav", url: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=80" },
        { name: "Hornbill Festival", url: "https://images.unsplash.com/photo-1593113115760-4927233261a8?auto=format&fit=crop&w=1000&q=80" },
        { name: "Surajkund International Crafts Mela", url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1000&q=80" }
    ];

    const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

    db.transaction(() => {
        for (const item of updates) {
            stmt.run(item.url, item.name);
        }
    })();

    console.log("Festival images restored with high-compatibility URLs.");
} catch (err) {
    console.error("Critical error restoring images:", err);
} finally {
    db.close();
}
