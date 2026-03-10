import axios from 'axios';

async function testForgotPassword() {
    try {
        console.log('Triggering forgot password for rincyjoseph2028@mca.ajce.in...');
        const res = await axios.post('http://localhost:3000/api/auth/forgot-password', {
            email: 'rincyjoseph2028@mca.ajce.in'
        });
        console.log('Response:', res.data);
    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) console.log('Data:', err.response.data);
    }
}

testForgotPassword();
