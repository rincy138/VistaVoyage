import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, ChevronDown } from 'lucide-react';
import './DestinationDetails.css';

const DestinationDetails = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch(`/api/packages?search=${name}`);
                const data = await res.json();

                // Filter and sort
                const filtered = data.filter(pkg =>
                    pkg.destination.toLowerCase().includes(name.toLowerCase()) ||
                    pkg.title.toLowerCase().includes(name.toLowerCase())
                );
                filtered.sort((a, b) => {
                    const durA = parseInt(a.duration) || 0;
                    const durB = parseInt(b.duration) || 0;
                    return durA - durB;
                });

                setPackages(filtered);
                if (filtered.length > 0) {
                    setSelectedPackage(filtered[0]);
                }
            } catch (err) {
                console.error("Error fetching destination details:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [name]);

    if (loading) return <div className="loading-container">Exploring {name}...</div>;

    // Parse JSON safely
    const parseJSON = (str, fallback = {}) => {
        try {
            return typeof str === 'string' ? JSON.parse(str) : (str || fallback);
        } catch (e) {
            return fallback;
        }
    };

    const itinerary = parseJSON(selectedPackage?.itinerary, []);
    const accessibility = parseJSON(selectedPackage?.accessibility_info, {});
    const emergency = parseJSON(selectedPackage?.emergency_info, {});
    const festival = parseJSON(selectedPackage?.festival_info, {});

    return (
        <div className="destination-details-page">
            <div className="details-hero" style={{ backgroundImage: `url(${selectedPackage?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2070'})` }}>
                <div className="details-hero-content">
                    <button className="back-link" onClick={() => navigate('/destinations')}>
                        <ArrowLeft size={18} /> Back to Destinations
                    </button>
                    <h1 className="hero-title">{name}</h1>
                    <div className="hero-location">
                        <MapPin size={18} />
                        <span>{selectedPackage?.destination || 'India'}</span>
                    </div>
                </div>
            </div>

            <div className="itinerary-wrapper">
                <div className="duration-selector-container">
                    <div className="duration-selector">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`duration-bubble ${selectedPackage?.id === pkg.id ? 'active' : ''}`}
                                onClick={() => setSelectedPackage(pkg)}
                            >
                                <span className="bubble-text">{pkg.duration}</span>
                                {selectedPackage?.id === pkg.id && (
                                    <div className="active-arrow">
                                        <ChevronDown size={32} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container">
                    <div className="itinerary-glass-card">
                        {selectedPackage ? (
                            <>
                                <div className="card-header">
                                    <div className="header-text">
                                        <div className="tags-row">
                                            {(selectedPackage.mood_tags || "").split(',').map(tag => (
                                                <span
                                                    key={tag}
                                                    className="mood-tag pointer"
                                                    onClick={() => navigate(`/packages?search=${tag.trim()}`)}
                                                >
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        <h2>{selectedPackage.title}</h2>
                                        <p>{selectedPackage.description}</p>
                                    </div>
                                    <div className="card-budget">
                                        <span className="budget-label">Estimated Budget</span>
                                        <span className="budget-price">
                                            <IndianRupee size={22} />
                                            {selectedPackage.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Smart Metrics Section */}
                                <div className="metrics-grid">
                                    <div className="metric-item">
                                        <div className="metric-label">Safety Score</div>
                                        <div className="metric-value">{selectedPackage.safety_score || '4.5'}/5.0</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">Crowd Level</div>
                                        <div className="metric-value">{selectedPackage.crowd_level || 'Medium'}</div>
                                    </div>
                                    <div className="metric-item">
                                        <div className="metric-label">Eco Score</div>
                                        <div className="metric-value">
                                            {[...Array(selectedPackage.eco_score || 4)].map((_, i) => (
                                                <span key={i}>≡ƒî▒</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="places-grid">
                                    <h3>Day-Wise Itinerary</h3>
                                    <div className="places-list">
                                        {itinerary.length > 0 ? itinerary.map((day, idx) => (
                                            <div key={idx} className="place-row-card">
                                                <div className="day-badge">Day {day.day}</div>
                                                {day.image && (
                                                    <div className="itinerary-img" style={{ backgroundImage: `url(${day.image})` }}></div>
                                                )}
                                                <div className="place-details">
                                                    <h4>{day.places.join(" & ")}</h4>
                                                    <p>{day.desc}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="place-row">
                                                <div className="place-marker"></div>
                                                <div className="place-details">
                                                    <h4>Local Sightseeing</h4>
                                                    <p>Standard sightseeing of the major attractions in {name}.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Special Features Sections */}
                                <div className="info-sections-grid">
                                    <div className="info-block accessibility">
                                        <h4>Accessibility info</h4>
                                        <ul>
                                            {accessibility.wheelchair && <li>ΓÖ┐ Wheelchair Accessible</li>}
                                            {accessibility.elderly && <li>≡ƒæ╡ Elderly Friendly</li>}
                                            {accessibility.medical && <li>≡ƒÅÑ Medical: {accessibility.medical} away</li>}
                                        </ul>
                                    </div>
                                    <div className="info-block emergency">
                                        <h4>Emergency Contacts</h4>
                                        <p>≡ƒÅÑ Hospital: {emergency.hospital}</p>
                                        <p>≡ƒô₧ Police: {emergency.police}</p>
                                        <p>≡ƒÜô Ambulance: {emergency.ambulance}</p>
                                    </div>
                                    {festival.event && (
                                        <div className="info-block festival">
                                            <h4>Local Festival</h4>
                                            <p>≡ƒÄë {festival.event} ({festival.month})</p>
                                            <p>Best time to experience local culture!</p>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <button className="book-trip-btn" onClick={() => navigate(`/packages/${selectedPackage.id}`)}>
                                        Book This Adventure
                                    </button>
                                    <button className="download-btn" onClick={() => window.print()}>
                                        Download Itinerary (PDF)
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="select-prompt">
                                <h3>Select a duration to see the plan</h3>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DestinationDetails;
