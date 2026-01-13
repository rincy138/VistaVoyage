import axios from 'axios';

async function test() {
    try {
        const pkgs = await axios.get('http://localhost:3000/api/packages');
        console.log('Packages count:', pkgs.data.length);

        const hotels = await axios.get('http://localhost:3000/api/hotels');
        console.log('Hotels count:', hotels.data.length);

        const taxis = await axios.get('http://localhost:3000/api/taxis');
        console.log('Taxis count:', taxis.data.length);
    } catch (err) {
        console.error('API test failed:', err.message);
    }
}

test();
