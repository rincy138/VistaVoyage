
import { db } from './database.js';

try {
    const tableInfo = db.pragma('table_info(bookings)');
    console.log('Bookings Table Schema:');
    console.table(tableInfo);

    const fkList = db.pragma('foreign_key_list(bookings)');
    console.log('Foreign Keys:');
    console.table(fkList);
} catch (err) {
    console.error(err);
}
