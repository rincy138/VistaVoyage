
import { db } from './server/database.js';

console.log("Checking Users...");
const users = db.prepare("SELECT user_id, name, email, role FROM users").all();
console.table(users);

console.log("\nTesting better-sqlite3 with undefined...");
try {
    // Create a temp table
    db.exec("CREATE TABLE IF NOT EXISTS test_undefined (id INTEGER PRIMARY KEY, val TEXT)");

    // Try inserting undefined
    const stmt = db.prepare("INSERT INTO test_undefined (val) VALUES (?)");
    stmt.run(undefined);
    console.log("Success! undefined was accepted (likely stored as null).");

    const row = db.prepare("SELECT * FROM test_undefined WHERE id = last_insert_rowid()").get();
    console.log("Inserted row:", row);
} catch (err) {
    console.error("FAIL! better-sqlite3 rejected undefined:", err.message);
}

// Clean up
db.exec("DROP TABLE IF EXISTS test_undefined");
