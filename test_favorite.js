import axios from 'axios';

const testFavoriteToggle = async () => {
    // You need to replace this with a real token from localStorage
    const token = 'YOUR_TOKEN_HERE'; // Get this from browser localStorage

    try {
        const res = await axios.post('http://localhost:3000/api/users/favorites/toggle',
            { itemId: 'Munnar', itemType: 'Destination' },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Success:', res.data);
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
};

console.log('To test, first get your token from browser localStorage, then run:');
console.log('Replace YOUR_TOKEN_HERE in this file and run: node test_favorite.js');
