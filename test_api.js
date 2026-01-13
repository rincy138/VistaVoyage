import axios from 'axios';

async function testApi() {
    try {
        console.log('Fetching /api/taxis...');
        const res = await axios.get('http://localhost:3000/api/taxis');
        console.log('Status:', res.status);
        console.log('Data Type:', typeof res.data);
        console.log('Is Array:', Array.isArray(res.data));
        if (Array.isArray(res.data)) {
            console.log('Count:', res.data.length);
            if (res.data.length > 0) {
                console.log('Sample:', JSON.stringify(res.data[0], null, 2));
            }
        } else {
            console.log('Response data:', res.data);
        }
    } catch (err) {
        console.error('Error fetching API:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

testApi();
