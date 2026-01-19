import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, MapPin, IndianRupee, ChevronDown } from 'lucide-react';
import FavoriteButton from '../components/FavoriteButton';
import './DestinationDetails.css';

const DestinationDetails = () => {
    const { name } = useParams();
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [activeRange, setActiveRange] = useState(null);
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');
    const detailsRef = useRef(null);

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
                    const range = `${d} Days ${d - 1} Nights`;
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
        const requestedDays = (() => {
            const match = requestedRange.match(/(\d+)\s+Day/i);
            return match ? parseInt(match[1]) : originalDays;
        })();

        // If requested is exactly original, return original
        if (originalDays === requestedDays) return basePrice.toLocaleString();

        // Calculate per-day price and scale (with a slight discount for longer trips)
        const perDay = basePrice / originalDays;
        const adjusted = perDay * requestedDays;
        return Math.round(adjusted).toLocaleString();
    };

    const getAdjustedItinerary = (originalItinerary, requestedRange) => {
        const days = (() => {
            const match = requestedRange.match(/(\d+)\s+Day/i);
            return match ? parseInt(match[1]) : 1;
        })();
        const itineraryArray = Array.isArray(originalItinerary) ? originalItinerary : [];

        const extraImages = [
            "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000", // Alleppey
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000", // Agra
            "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000", // Varanasi
            "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2000", // Goa
            "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2000", // Manali
            "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000", // Munnar
            "https://images.unsplash.com/photo-1590050752117-23aae2fc28ee?q=80&w=2000", // Rishikesh
            "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000", // Landscape
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000", // Mountain 
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2000", // Lake
            "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000", // Nature
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000", // Forest
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2000", // Valley
            "https://images.unsplash.com/photo-1433838552652-f9a46b332c40?q=80&w=2000"  // Clouds 
        ];

        // 1. Create a workspace array
        let adjusted = [...itineraryArray];

        // 2. Ensure all existing days have images
        for (let i = 0; i < adjusted.length; i++) {
            if (!adjusted[i].image || adjusted[i].image === "" || adjusted[i].image.includes("undefined")) {
                adjusted[i].image = extraImages[i % extraImages.length];
            }
        }

        // 3. If we need more days, pad them
        if (adjusted.length < days) {
            for (let i = adjusted.length + 1; i <= days; i++) {
                adjusted.push({
                    day: i,
                    title: i === 1 ? `Welcome to ${name}` : (i === days ? `Final Sightseeing in ${name}` : "Extended Exploration"),
                    desc: `Experience the premium side of ${name} with curated local experiences and luxury leisure.`,
                    image: extraImages[(i + name.length) % extraImages.length]
                });
            }
        }

        // 4. Return exactly the number of days requested
        return adjusted.slice(0, days);
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

                    <div className="hero-title-row">
                        <div className="favorite-action">
                            <FavoriteButton itemId={name} itemType="Destination" />
                        </div>
                        <h1 className="hero-title">{name}</h1>
                    </div>
                    <div className="hero-location">
                        <MapPin size={18} />
                        <span>{selectedPackage?.destination || 'India'}</span>
                    </div>
                </div>
            </div>

            <div className="itinerary-wrapper">
                {context === 'hotel' ? (
                    <div className="container duration-selector-container">
                        <div className="duration-select-box">
                            <label>TRIP DURATION</label>
                            <select
                                value={activeRange}
                                onChange={(e) => setActiveRange(e.target.value)}
                                className="premium-duration-select"
                            >
                                {["2 Days 1 Night", "3 Days 2 Nights", "4 Days 3 Nights", "5 Days 4 Nights", "6 Days 5 Nights", "7 Days 6 Nights", "8 Days 7 Nights", "9 Days 8 Nights", "10 Days 9 Nights", "11 Days 10 Nights", "12 Days 11 Nights", "13 Days 12 Nights", "14 Days 13 Nights"].map(range => (
                                    <option key={range} value={range}>{range}</option>
                                ))}
                            </select>
                            <ChevronDown className="select-arrow" size={18} />
                        </div>
                    </div>
                ) : (
                    <div className="container">
                        <div className="section-header">
                            <h2>Choose Your <span>{name}</span> Plan</h2>
                            <p>Select a duration to see how we add more hidden gems to your trip</p>
                        </div>

                        <div className="duration-comparison-grid">
                            {["2 Days 1 Night", "3 Days 2 Nights", "4 Days 3 Nights", "5 Days 4 Nights", "6 Days 5 Nights", "7 Days 6 Nights", "8 Days 7 Nights", "9 Days 8 Nights", "10 Days 9 Nights", "11 Days 10 Nights", "12 Days 11 Nights", "13 Days 12 Nights", "14 Days 13 Nights"].map((range) => {
                                const matchingPkg = packages.find(p => {
                                    const d = parseInt(p.duration);
                                    const daysMatch = range.match(/(\d+)\s+Day/i);
                                    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
                                    return d === days || Math.abs(d - days) <= 1;
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
                                            const targetPkg = matchingPkg || selectedPackage;
                                            if (targetPkg) {
                                                navigate(`/packages/${targetPkg.id}?duration=${range}${context ? `&context=${context}` : ''}`);
                                            }
                                        }}
                                    >
                                        <div className="card-image">
                                            <img
                                                src={rangeItinerary[rangeItinerary.length - 1]?.image || selectedPackage?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2070'}
                                                alt=""
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2070";
                                                }}
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
                )}

                <div className="container detailed-plan-section" ref={detailsRef}>
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
                                        <h2>{selectedPackage.title} ({activeRange} Plan)</h2>
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
                                    <button className="book-trip-btn" onClick={() => navigate(`/packages/${selectedPackage.id}?duration=${activeRange}${context ? `&context=${context}` : ''}`)}>
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
