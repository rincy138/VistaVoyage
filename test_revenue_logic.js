
import Database from 'better-sqlite3';
const db = new Database('server/data/vistavoyage.db');

const bookings = db.prepare('SELECT status, refund_status, total_amount, refund_amount FROM bookings').all();

let total = 0;
bookings.forEach(b => {
    let rev = 0;
    if (b.status === 'Confirmed') {
        rev = b.total_amount;
    } else if (b.status === 'Cancelled') {
        if (!b.refund_status || b.refund_status === 'Rejected') {
            rev = b.total_amount;
        } else if (b.refund_status === 'Completed') {
            rev = b.total_amount - (b.refund_amount || 0);
        }
    }
    total += rev;
    console.log(`Status: ${b.status}, Refund: ${b.refund_status}, Amount: ${b.total_amount}, RefundAmt: ${b.refund_amount} => Revenue: ${rev}`);
});

console.log('Final Total Revenue:', total);
