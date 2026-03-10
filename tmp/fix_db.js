import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'server', 'data', 'vistavoyage.db');
const db = new Database(dbPath);

console.log('Using DB at:', dbPath);

try {
    db.exec('ALTER TABLE group_expenses ADD COLUMN expense_type TEXT DEFAULT "expense"');
    console.log('Added expense_type column');
} catch (e) {
    console.log('expense_type adjustment:', e.message);
}

try {
    db.exec('ALTER TABLE group_expenses ADD COLUMN recipient_id INTEGER');
    console.log('Added recipient_id column');
} catch (e) {
    console.log('recipient_id adjustment:', e.message);
}
db.close();
