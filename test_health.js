
import axios from 'axios';

async function test() {
    try {
        const res = await axios.get('http://localhost:3000/api/health');
        console.log('Health:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
