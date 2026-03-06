
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { JWT_SECRET } from './server/middleware/auth.js';

const token = jwt.sign({ id: 1, role: 'Traveler' }, JWT_SECRET, { expiresIn: '1h' });

const triggerSos = async () => {
    try {
        const res = await axios.post('http://localhost:3000/api/sos/trigger', {
            location: { lat: 12.3456, lng: 78.9012 },
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response:', res.data);
    } catch (err) {
        if (err.response) {
            console.error('API Error Response:', err.response.data);
        } else {
            console.error('Request Error:', err.message);
        }
    }
};

triggerSos();
