import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const updates = [
    {
        name: "Sonepur Mela",
        url: "https://images.unsplash.com/photo-1599335804683-16a3a9856a64?auto=format&fit=crop&w=800&q=80"
    },
    {
        name: "Hornbill Festival",
        url: "https://images.unsplash.com/photo-1593113115760-4927233261a8?auto=format&fit=crop&w=800&q=80"
    }
];

const stmt = db.prepare('UPDATE festivals SET image_url = ? WHERE name = ?');

const updateMany = db.transaction((data) => {
    for (const item of data) {
        const result = stmt.run(item.url, item.name);
        console.log(`Updated ${item.name}: ${result.changes} rows`);
    }
});

try {
    updateMany(updates);
    console.log("Database updated successfully with corresponding images.");
} catch (err) {
    console.error("Database update failed:", err);
}

db.close();
