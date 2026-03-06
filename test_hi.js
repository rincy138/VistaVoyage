
import axios from 'axios';

async function test() {
    try {
        const res = await axios.post('http://localhost:3000/api/chatbot/message', {
            message: 'hi'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.log('Data:', err.response.data);
    }
}

test();
