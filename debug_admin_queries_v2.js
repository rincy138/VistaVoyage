
import { db } from './server/database.js';

function test(name, query) {
  try {
    const result = db.prepare(query).get();
    console.log(`${name}:`, result);
  } catch (err) {
    console.error(`${name} FAILED:`, err.message);
  }
}

console.log('--- Testing individual stat queries ---');
test('Total Users', 'SELECT COUNT(*) as count FROM users');
test('Total Agents', 'SELECT COUNT(*) as count FROM users WHERE role = "Agent"');
test('Total Destinations', 'SELECT COUNT(*) as count FROM destinations');
test('Total Bookings', 'SELECT COUNT(*) as count FROM bookings');
test('Total Revenue', 'SELECT SUM(total_amount) as sum FROM bookings WHERE status = "Confirmed"');
