import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const carImages = [
    "https://images.unsplash.com/photo-1550355403-51975078382d",
    "https://images.unsplash.com/photo-1549194388-f61be84a6e9e",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
    "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
    "https://images.unsplash.com/photo-1563720223185-11003d516935",
    "https://images.unsplash.com/photo-1565043589221-1a6f99347523",
    "https://images.unsplash.com/photo-1594502184342-2e12f877aa73"
];

console.log("Ensuring all taxis have valid images...");

const taxis = db.prepare('SELECT id, type FROM taxis').all();

const updateStmt = db.prepare('UPDATE taxis SET image = ? WHERE id = ?');

db.transaction(() => {
    let count = 0;
    taxis.forEach((taxi, index) => {
        // Selection based on index for stability across runs, but looks random to user
        const imgBase = carImages[index % carImages.length];
        const finalImg = `${imgBase}?auto=format&fit=crop&w=1000&q=80&sig=${taxi.id}`;
        updateStmt.run(finalImg, taxi.id);
        count++;
    });
    console.log(`Updated ${count} taxi images.`);
})();
