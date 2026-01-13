import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const FavoriteButton = ({ itemId, itemType, initialIsFavorite = false }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const res = await axios.get(`/api/users/favorites/check/${itemType}/${encodeURIComponent(itemId)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setIsFavorite(res.data.isFavorite);
            } catch (err) {
                console.error('Error checking favorite status:', err);
                // Fallback to initial value
                setIsFavorite(initialIsFavorite);
            }
        };

        if (initialIsFavorite) {
            setIsFavorite(true);
        } else {
            checkFavoriteStatus();
        }
    }, [itemId, itemType, initialIsFavorite]);

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to save favorites');
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post('/api/users/favorites/toggle',
                { itemId, itemType },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Update state based on server response
            const newState = res.data.action === 'added';
            setIsFavorite(newState);
        } catch (err) {
            console.error('Error toggling favorite:', err);
            // Don't show alert, just silently fail and keep current state
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button
            whileTap={{ scale: 0.8 }}
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            disabled={isLoading}
            style={{
                background: 'rgba(0,0,0,0.3)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: isFavorite ? '#ef4444' : 'white',
                backdropFilter: 'blur(5px)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                pointerEvents: 'auto',
                position: 'relative'
            }}
        >
            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </motion.button>
    );
};

export default FavoriteButton;
