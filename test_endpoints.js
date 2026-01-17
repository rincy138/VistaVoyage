
import axios from 'axios';

async function testEndpoints() {
    try {
        console.log('Testing Hotels API...');
        const hotels = await axios.get('http://localhost:3000/api/hotels');
        console.log(`Hotels Status: ${hotels.status}, Count: ${hotels.data.length}`);

        console.log('Testing Taxis API...');
        const taxis = await axios.get('http://localhost:3000/api/taxis');
        console.log(`Taxis Status: ${taxis.status}, Count: ${taxis.data.length}`);

    } catch (err) {
        console.error('API Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

testEndpoints();
