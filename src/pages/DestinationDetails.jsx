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
    const [activeRange, setActiveRange] = useState(null);

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
                    const firstPkg = filtered[0];
                    setSelectedPackage(firstPkg);
                    // Match the initial range
                    const d = parseInt(firstPkg.duration);
                    const range = `${d}-${d + 1} days`;
                    setActiveRange(range);
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

    // Dynamic adjustment logic
    const getAdjustedPrice = (price, originalDuration, requestedRange) => {
        const basePrice = parseFloat(price);
        const originalDays = parseInt(originalDuration) || 1;
        const requestedDays = parseInt(requestedRange.split('-')[1]) || originalDays;

        // If requested is exactly original, return original
        if (originalDays === requestedDays) return basePrice.toLocaleString();

        // Calculate per-day price and scale (with a slight discount for longer trips)
        const perDay = basePrice / originalDays;
        const adjusted = perDay * requestedDays;
        return Math.round(adjusted).toLocaleString();
    };

    const getAdjustedItinerary = (originalItinerary, requestedRange) => {
        const days = parseInt(requestedRange.split('-')[1]);
        if (!originalItinerary || originalItinerary.length === 0) return [];

        if (originalItinerary.length >= days) {
            return originalItinerary.slice(0, days);
        }

        // If requested more days than we have, pad with generic activities
        const adjusted = [...originalItinerary];
        for (let i = originalItinerary.length + 1; i <= days; i++) {
            adjusted.push({
                day: i,
                title: "Extended Exploration",
                desc: `Discover hidden gems and local secrets in ${name}. Personal leisure and shopping time.`
            });
        }
        return adjusted;
    };

    const rawItinerary = parseJSON(selectedPackage?.itinerary, []);
    const itinerary = activeRange ? getAdjustedItinerary(rawItinerary, activeRange) : rawItinerary;
    const displayPrice = activeRange ? getAdjustedPrice(selectedPackage?.price, selectedPackage?.duration, activeRange) : selectedPackage?.price?.toLocaleString();

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
                <div className="container">
                    <div className="section-header">
                        <h2>Choose Your <span>{name}</span> Plan</h2>
                        <p>Select a duration to see how we add more hidden gems to your trip</p>
                    </div>

                    <div className="duration-comparison-grid">
                        {["1-2 days", "2-3 days", "3-4 days", "4-5 days", "5-6 days", "6-7 days", "7-8 days", "8-9 days", "9-10 days", "10-11 days", "11-12 days", "12-13 days", "13-14 days"].map((range) => {
                            const matchingPkg = packages.find(p => {
                                const d = parseInt(p.duration);
                                const [min, max] = range.split('-').map(s => parseInt(s));
                                return d >= min && d <= max;
                            });

                            const isActive = activeRange === range;
                            const rangeItinerary = getAdjustedItinerary(parseJSON(selectedPackage?.itinerary, []), range);
                            const highlightsCount = rangeItinerary.length;
                            const mainPlaces = rangeItinerary.slice(0, 3).map(day => day.title).join(", ");

                            return (
                                <div
                                    key={range}
                                    className={`duration-plan-card ${isActive ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveRange(range);
                                        if (matchingPkg) setSelectedPackage(matchingPkg);
                                    }}
                                >
                                    <div className="card-image">
                                        <img
                                            src={rangeItinerary[rangeItinerary.length - 1]?.image || selectedPackage?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2070'}
                                            alt={range}
                                        />
                                    </div>
                                    <div className="day-label-box">{range.toUpperCase()}</div>
                                    <div className="itinerary-content">
                                        <h4>₹{getAdjustedPrice(selectedPackage?.price, selectedPackage?.duration, range)} Journey</h4>
                                        <p>
                                            Includes visiting {mainPlaces}
                                            {highlightsCount > 3 ? ` and ${highlightsCount - 3} other amazing spots in ${name}.` : '.'}
                                        </p>
                                    </div>
                                    <div className="select-plan-indicator" style={{ marginTop: 'auto', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        {isActive ? '✓ CURRENT SELECTION' : 'CHOOSE THIS PLAN →'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="container detailed-plan-section">
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
                                        <h2>{selectedPackage.title} (Detailed {activeRange} Plan)</h2>
                                        <p>{selectedPackage.description}</p>
                                    </div>
                                    <div className="card-budget">
                                        <span className="budget-label">Estimated Budget ({activeRange})</span>
                                        <span className="budget-price">
                                            <IndianRupee size={22} />
                                            {displayPrice}
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
                                            {[...Array(parseInt(selectedPackage.eco_score) || 4)].map((_, i) => (
                                                <span key={i}>🌱</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="places-grid">
                                    <h3 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Day-Wise Itinerary</h3>
                                    <div className="itinerary-grid">
                                        {itinerary.length > 0 ? itinerary.map((day, idx) => (
                                            <div key={idx} className="itinerary-card">
                                                <div className="card-image">
                                                    <img src={day.image || selectedPackage?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2070'} alt={`Day ${day.day}`} />
                                                </div>
                                                <div className="day-label-box">Day {day.day}</div>
                                                <div className="itinerary-content">
                                                    <h4>{day.title || "Sightseeing"}</h4>
                                                    <p>{day.desc}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="itinerary-card">
                                                <div className="day-label-box">Day 1</div>
                                                <div className="itinerary-content">
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
                                            {accessibility.wheelchair && <li>♿ Wheelchair Accessible</li>}
                                            {accessibility.elderly && <li>👵 Elderly Friendly</li>}
                                            {accessibility.medical && <li>🏥 Medical: {accessibility.medical} away</li>}
                                        </ul>
                                    </div>
                                    <div className="info-block emergency">
                                        <h4>Emergency Contacts</h4>
                                        <p>🏥 Hospital: {emergency.hospital}</p>
                                        <p>📞 Police: {emergency.police}</p>
                                        <p>🚓 Ambulance: {emergency.ambulance}</p>
                                    </div>
                                    {festival.event && (
                                        <div className="info-block festival">
                                            <h4>Local Festival</h4>
                                            <p>🎉 {festival.event} ({festival.month})</p>
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
