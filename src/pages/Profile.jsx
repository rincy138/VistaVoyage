import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Heart, History, Award, Edit2, LogOut, Package, Hotel, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('favorites');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const [userRes, favRes] = await Promise.all([
                axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/users/favorites', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setUser(userRes.data);
            setFavorites(favRes.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (isLoading) return <div className="loading-state">Loading your journey...</div>;

    return (
        <div className="profile-page">
            <div className="container">
                <div className="profile-grid">
                    {/* Left Column: User Info Card */}
                    <div className="profile-sidebar">
                        <motion.div
                            className="glass-card user-info-card"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    <img
                                        src={user?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                                        alt="Avatar"
                                    />
                                    <button className="edit-avatar"><Edit2 size={14} /></button>
                                </div>
                                <h2>{user?.name}</h2>
                                <span className="user-role">{user?.role}</span>
                            </div>

                            <div className="user-details-list">
                                <div className="detail-item">
                                    <Mail size={18} />
                                    <span>{user?.email}</span>
                                </div>
                                <div className="detail-item">
                                    <Phone size={18} />
                                    <span>{user?.phone || 'Add phone number'}</span>
                                </div>
                                <div className="detail-item">
                                    <MapPin size={18} />
                                    <span>{user?.cities_visited?.length || 0} Cities Visited</span>
                                </div>
                            </div>

                            <div className="profile-stats-grid">
                                <div className="stat-card">
                                    <Award size={24} />
                                    <div className="stat-info">
                                        <h4>{user?.total_kms || 0}</h4>
                                        <p>KMs Covered</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <History size={24} />
                                    <div className="stat-info">
                                        <h4>{user?.cities_visited?.length || 0}</h4>
                                        <p>Total Trips</p>
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </div>

                    {/* Right Column: Main Content */}
                    <div className="profile-main">
                        <div className="tabs-header glass-card">
                            <button
                                className={activeTab === 'favorites' ? 'active' : ''}
                                onClick={() => setActiveTab('favorites')}
                            >
                                <Heart size={18} /> Favorites ({favorites.length})
                            </button>
                            <button
                                className={activeTab === 'stats' ? 'active' : ''}
                                onClick={() => setActiveTab('stats')}
                            >
                                <Award size={18} /> Journey Stats
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeTab === 'favorites' ? (
                                <motion.div
                                    key="favorites"
                                    layout
                                    className="fav-items-grid"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {favorites.length > 0 ? (
                                        favorites.map(item => (
                                            <div key={`${item.item_type}-${item.item_id}`} className="fav-item glass-card">
                                                <img src={item.image} alt={item.title} />
                                                <div className="fav-item-info">
                                                    <div className="type-badge">
                                                        {item.item_type === 'Package' && <Package size={12} />}
                                                        {item.item_type === 'Hotel' && <Hotel size={12} />}
                                                        {item.item_type === 'Taxi' && <Car size={12} />}
                                                        {item.item_type === 'Destination' && <MapPin size={12} />}
                                                        {item.item_type}
                                                    </div>
                                                    <h3>{item.title}</h3>
                                                    <button
                                                        className="view-btn"
                                                        onClick={() => {
                                                            if (item.item_type === 'Package') navigate(`/packages/${item.item_id}`);
                                                            else if (item.item_type === 'Destination') navigate(`/destinations/${item.item_id}`);
                                                            else if (item.item_type === 'Hotel') navigate('/hotels');
                                                            else navigate('/taxis');
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state glass-card">
                                            <Heart size={48} />
                                            <h3>Your wishlist is empty</h3>
                                            <p>Start explorers destinations and save your favorites here!</p>
                                            <button className="btn btn-primary" onClick={() => navigate('/destinations')}>Explore Now</button>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="stats"
                                    className="journey-stats-section glass-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <h3>Cities You've Explored</h3>
                                    <div className="cities-cloud">
                                        {user?.cities_visited?.length > 0 ? user.cities_visited.map(city => (
                                            <span key={city} className="city-tag">{city}</span>
                                        )) : <p>Your first adventure awaits!</p>}
                                    </div>

                                    <div className="badges-section">
                                        <h3>Your Travel Achievements</h3>
                                        <div className="badges-grid">
                                            <div className={`badge-item ${user?.total_kms > 500 ? 'unlocked' : 'locked'}`}>
                                                <Award size={32} />
                                                <p>Road Warrior (500km)</p>
                                            </div>
                                            <div className={`badge-item ${user?.cities_visited?.length >= 3 ? 'unlocked' : 'locked'}`}>
                                                <MapPin size={32} />
                                                <p>Explorer (3 Cities)</p>
                                            </div>
                                            <div className={`badge-item ${user?.cities_visited?.length >= 5 ? 'unlocked' : 'locked'}`}>
                                                <Award size={32} />
                                                <p>Globetrotter (5 Cities)</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
