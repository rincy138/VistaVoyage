import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, Smartphone, Users, Globe, Award } from 'lucide-react';
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

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [destinations, loading]);

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

            <section className="mood-section container reveal">
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

            <section className="stats-section reveal">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <Users size={32} />
                            <h3>50k+</h3>
                            <p>Happy Travelers</p>
                        </div>
                        <div className="stat-item">
                            <Globe size={32} />
                            <h3>70+</h3>
                            <p>Destinations</p>
                        </div>
                        <div className="stat-item">
                            <Award size={32} />
                            <h3>15+</h3>
                            <p>Years Excellence</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="destinations-section reveal">
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

            <section className="features-section reveal">
                <div className="container">
                    <div className="section-header center">
                        <h2 className="section-title">Why <span>VistaVoyage</span></h2>
                        <p>We redefine how you explore the world with personalized premium services</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><Shield size={24} /></div>
                            <h3>Safe & Secure</h3>
                            <p>Your safety is our priority with verified partners and 24/7 support.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Target size={24} /></div>
                            <h3>Personalized Plans</h3>
                            <p>Custom itineraries tailored to your specific travel interests.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Smartphone size={24} /></div>
                            <h3>Direct Booking</h3>
                            <p>Seamlessly book your entire trip in just a few simple taps.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="smart-planner-cta container reveal">
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
