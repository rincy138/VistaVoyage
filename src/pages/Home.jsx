import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, Smartphone, Users, Globe, Award, Tag, Hotel, Car } from 'lucide-react';
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

                // Group by destination name and aggregate all unique moods
                const destMap = new Map();

                data.forEach(pkg => {
                    const cityName = pkg.destination.split(',')[0].trim();
                    if (!destMap.has(cityName)) {
                        destMap.set(cityName, {
                            id: pkg.id,
                            title: cityName,
                            location: pkg.destination,
                            image: pkg.image_url,
                            price: `Starts from ₹${pkg.price}`,
                            moods: new Set()
                        });
                    }
                    if (pkg.mood_tags) {
                        pkg.mood_tags.split(',').forEach(tag => destMap.get(cityName).moods.add(tag.trim()));
                    }
                });

                const uniqueDests = Array.from(destMap.values()).map(d => ({
                    ...d,
                    moods: Array.from(d.moods).join(', ')
                }));

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

    const filterByMood = (mood) => {
        setSelectedMood(mood);
        const moodCuration = {
            'Relax': ['Alleppey', 'Goa', 'Munnar', 'Puducherry', 'Varkala', 'Gokarna'],
            'Adventure': ['Leh', 'Rishikesh', 'Manali', 'Wayanad', 'Spiti', 'Aizawl'],
            'Romantic': ['Udaipur', 'Srinagar', 'Munnar', 'Andaman Islands', 'Ooty', 'Kovalam'],
            'Spiritual': ['Varanasi', 'Rishikesh', 'Amritsar', 'Tirupati', 'Madurai', 'Hampi'],
            'Nature': ['Wayanad', 'Munnar', 'Kaziranga', 'Cherrapunji', 'Coorg', 'Araku']
        };

        if (mood === 'All') {
            setFilteredDests(destinations.slice(0, 6));
        } else {
            const curatedNames = moodCuration[mood] || [];
            let temp = destinations.filter(d => curatedNames.includes(d.title));

            // If we don't have enough matching ones from curated list, supplement with mood_tags match
            if (temp.length < 4) {
                const tagMatches = destinations.filter(d =>
                    d.moods && d.moods.includes(mood) && !temp.find(t => t.id === d.id)
                );
                temp.push(...tagMatches);
            }
            setFilteredDests(temp.slice(0, 8)); // Show up to 8 destinations for a mood
        }
    };

    useEffect(() => {
        filterByMood(selectedMood);
    }, [selectedMood, destinations]); // Re-run filter when mood or destinations change

    return (
        <div className="home-page">
            <Hero />

            <section className="quick-services-section container reveal">
                <div className="section-header center">
                    <h2 className="section-title">Essential <span>Travel Services</span></h2>
                    <p>Everything you need for a seamless journey, all in one place</p>
                </div>
                <div className="services-grid-home">
                    <div className="service-card-home glass-card" onClick={() => navigate('/travel-offers')}>
                        <div className="service-icon-home"><Tag size={32} /></div>
                        <h3>Travel Offers</h3>
                        <p>Exclusive deals and limited-time discounts</p>
                        <button className="service-btn-home">View Deals</button>
                    </div>
                    <div className="service-card-home glass-card" onClick={() => navigate('/hotels')}>
                        <div className="service-icon-home"><Hotel size={32} /></div>
                        <h3>Premium Stays</h3>
                        <p>Curated hotels and resorts for every budget</p>
                        <button className="service-btn-home">Book Hotel</button>
                    </div>
                    <div className="service-card-home glass-card" onClick={() => navigate('/taxis')}>
                        <div className="service-icon-home"><Car size={32} /></div>
                        <h3>City Transfers</h3>
                        <p>Safe and reliable local taxi services</p>
                        <button className="service-btn-home">Get a Taxi</button>
                    </div>
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
                    <div className="section-header">
                        <h2 className="section-title">Popular <span>Destinations</span></h2>
                        <button className="btn btn-outline" onClick={() => navigate('/destinations')}>View All Destinations</button>
                    </div>
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
