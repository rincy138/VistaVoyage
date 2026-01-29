
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testAdminStats() {
    try {
        console.log('Attempting to login as admin...');
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'testadmin@gmail.com',
            password: 'admin123'
        });

        const token = loginRes.data.token;
        console.log('Login successful. Token acquired.');

        console.log('Fetching admin stats...');
        const statsRes = await axios.get(`${BASE_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Stats Response:', statsRes.data);

        console.log('Fetching admin bookings...');
        const bookingsRes = await axios.get(`${BASE_URL}/api/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('Bookings count:', bookingsRes.data.length);

    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testAdminStats();
