import fetch from 'node-fetch';

async function testApi() {
    try {
        const response = await fetch('http://localhost:3000/api/festivals/upcoming');
        const data = await response.json();
        console.log('--- API URLs ---');
        data.forEach(f => {
            console.log(`${f.name}: ${f.image_url}`);
        });
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testApi();
