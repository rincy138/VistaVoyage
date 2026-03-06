import fetch from 'node-fetch';

async function checkApi() {
    try {
        const response = await fetch('http://localhost:5000/api/festivals/upcoming');
        const data = await response.json();
        console.log('API RESPONSE HEAD:');
        console.log(JSON.stringify(data[0], null, 2));
        console.log('IMAGE URL FOR FIRST ITEM:');
        console.log(data[0].image_url);
    } catch (error) {
        console.error('API FETCH FAILED:', error.message);
    }
}

checkApi();
