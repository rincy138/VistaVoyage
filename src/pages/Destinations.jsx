import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FavoriteButton from '../components/FavoriteButton';
import './Destinations.css';

const Destinations = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages');
                const data = await res.json();
                setPackages(data);
            } catch (err) {
                console.error("Failed to fetch destinations", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // Extract unique destinations based on city name (from package title or destination field)
    // For this implementation, we'll treat each package as a potential "destination" card 
    // to showcase the variety, or group them by the 'destination' field.
    const filteredDestinations = packages.filter(pkg =>
        pkg.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping by destination string to show unique cities
    const uniqueDestinations = [];
    const seenDestinations = new Set();

    filteredDestinations.forEach(pkg => {
        const cityName = pkg.destination.split(',')[0].trim();
        if (!seenDestinations.has(cityName)) {
            seenDestinations.add(cityName);
            uniqueDestinations.push({
                name: cityName,
                fullLocation: pkg.destination,
                image: pkg.image_url,
                description: pkg.description,
                price: pkg.price,
                packageId: pkg.id,
                duration: pkg.duration,
                safety_score: pkg.safety_score,
                inclusions: pkg.inclusions
            });
        }
    });

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCardClick = (pkgId) => {
        navigate(`/packages?search=${searchTerm}`);
    };

    return (
        <div className="destinations-page">
            <div className="destinations-hero">
                <div className="container">
                    <h1>Explore India</h1>
                    <p>From the Himalayas to the Indian Ocean, discover the beauty of every state.</p>
                </div>
            </div>

            <div className="container">


                {loading ? (
                    <div className="loading-spinner">Loading destinations...</div>
                ) : (
                    <div className="dest-grid">
                        {uniqueDestinations.length > 0 ? (
                            uniqueDestinations.map((dest, index) => (
                                <div
                                    key={index}
                                    className="minimal-card v3-update"
                                    onClick={() => navigate(`/destinations/${dest.name}${context ? `?context=${context}` : ''}`)}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{ position: 'relative', height: '220px' }}>
                                        <img
                                            src={dest.image}
                                            alt={dest.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '15px',
                                            left: '15px',
                                            background: 'rgba(0, 0, 0, 0.6)',
                                            color: '#2DD4BF',
                                            border: '1px solid #2DD4BF',
                                            padding: '6px 16px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: '800',
                                            letterSpacing: '1px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {dest.duration ? dest.duration.toUpperCase() : '5 DAYS 4 NIGHTS'}
                                        </div>
                                        <div className="favorite-action" style={{ position: 'absolute', top: '15px', right: '15px' }}>
                                            <FavoriteButton itemId={dest.name} itemType="Destination" />
                                        </div>
                                    </div>

                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0px', flexGrow: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h3 style={{
                                                fontSize: '1.4rem',
                                                fontWeight: '800',
                                                margin: '0',
                                                color: 'white'
                                            }}>{dest.name}</h3>
                                            <span style={{
                                                background: '#065f46',
                                                color: '#34d399',
                                                padding: '4px 8px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                fontWeight: 'bold'
                                            }}>{dest.safety_score || '4.8'}/5</span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#9ca3af', marginBottom: '10px' }}>
                                            <MapPin size={14} />
                                            <span>{dest.fullLocation}</span>
                                        </div>

                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#9ca3af',
                                            margin: '0 0 20px 0',
                                            lineHeight: '1.5',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {dest.description || `Explore the beauty of ${dest.name} with our curated premium packages.`}
                                        </p>

                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }}></div>

                                        {/* Inclusions Row */}
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            marginBottom: '20px'
                                        }}>
                                            {(() => {
                                                let items = [];
                                                try {
                                                    items = typeof dest.inclusions === 'string'
                                                        ? JSON.parse(dest.inclusions)
                                                        : (Array.isArray(dest.inclusions) ? dest.inclusions : []);
                                                } catch (e) { items = []; }

                                                return items.slice(0, 4).map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '50%',
                                                            background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf',
                                                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                            fontSize: '0.7rem',
                                                            flexShrink: 0
                                                        }}>✓</div>
                                                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: '500' }}>{item}</span>
                                                    </div>
                                                ));
                                            })()}
                                        </div>

                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '20px' }}></div>

                                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div>
                                                {/* Price removed as per request */}
                                            </div>
                                            <button style={{
                                                background: 'transparent',
                                                border: '1px solid #2dd4bf',
                                                color: '#2dd4bf',
                                                padding: '8px 20px',
                                                borderRadius: '50px',
                                                fontWeight: '700',
                                                fontSize: '0.95rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                textTransform: 'capitalize'
                                            }}>
                                                Explore
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-destinations">
                                <h3>No destinations found matching "{searchTerm}"</h3>
                                <p>Try searching for a different state or city.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Destinations;
