
import axios from 'axios';

async function testChatbot() {
    try {
        console.log('Testing Chatbot API...');
        const res = await axios.post('http://localhost:3000/api/chatbot/message', {
            message: 'i need hotels in munnar'
        });
        console.log('Chatbot Response:', res.data.response);
    } catch (err) {
        console.error('API Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

testChatbot();
