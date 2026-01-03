import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import DestinationCard from '../components/DestinationCard';
import './Home.css';

const Home = () => {
    const [destinations, setDestinations] = useState([]);
    const [filteredDests, setFilteredDests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMood, setSelectedMood] = useState('All');
    const navigate = useNavigate();

    const moods = [
        { name: 'All', emoji: '🌟' },
        { name: 'Relax', emoji: '😌' },
        { name: 'Adventure', emoji: '🧗' },
        { name: 'Romantic', emoji: '😍' },
        { name: 'Spiritual', emoji: '🛕' },
        { name: 'Nature', emoji: '🌿' }
    ];

    useEffect(() => {
        const fetchDestinations = async () => {
            try {
                const res = await fetch('/api/packages');
                const data = await res.json();

                // Group by destination name to show unique cities
                const uniqueDests = [];
                const seen = new Set();

                data.forEach(pkg => {
                    const cityName = pkg.destination.split(',')[0].trim();
                    if (!seen.has(cityName)) {
                        seen.add(cityName);
                        uniqueDests.push({
                            id: pkg.id,
                            title: cityName,
                            location: pkg.destination,
                            image: pkg.image_url,
                            price: `Starts from ₹${pkg.price}`,
                            moods: pkg.mood_tags || ""
                        });
                    }
                });

                setDestinations(uniqueDests);
                setFilteredDests(uniqueDests.slice(0, 6));
            } catch (err) {
                console.error("Error fetching home destinations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDestinations();
    }, []);

    useEffect(() => {
        if (selectedMood === 'All') {
            setFilteredDests(destinations.slice(0, 6));
        } else {
            const temp = destinations.filter(d => d.moods.includes(selectedMood));
            setFilteredDests(temp);
        }
    }, [selectedMood, destinations]);

    return (
        <div className="home-page">
            <Hero />

            <section className="mood-section container">
                <div className="section-header center">
                    <h2 className="section-title">Find Your <span>Vibe</span></h2>
                    <p>Select a mood and let us recommend your next escape</p>
                </div>
                <div className="mood-selector">
                    {moods.map(mood => (
                        <button
                            key={mood.name}
                            className={`mood-btn ${selectedMood === mood.name ? 'active' : ''}`}
                            onClick={() => setSelectedMood(mood.name)}
                        >
                            <span className="mood-emoji">{mood.emoji}</span>
                            <span className="mood-name">{mood.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="destinations-section">
                <div className="container">
                    <h2 className="section-title">Popular <span>Destinations</span></h2>
                    {loading ? (
                        <div className="loading-spinner">Loading destinations...</div>
                    ) : (
                        <div className="destinations-grid">
                            {filteredDests.length > 0 ? filteredDests.map(dest => (
                                <DestinationCard key={dest.id} destination={dest} />
                            )) : (
                                <div className="no-mood-results">
                                    <p>No destinations found for this mood yet. Try another one!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="smart-planner-cta container">
                <div className="planner-card">
                    <div className="planner-content">
                        <h2>Smart Trip Planner</h2>
                        <p>Tell us your budget, days, and interest. We'll build your perfect itinerary in seconds.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/smart-planner')}>Try Smart Planner</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
