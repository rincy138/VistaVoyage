import { useState, useEffect } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
                packageId: pkg.id
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
                <div className="search-container">
                    <div className="search-box">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" size={20} />
                            <input
                                type="text"
                                placeholder="Search by city, state or landmark..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading destinations...</div>
                ) : (
                    <div className="dest-grid">
                        {uniqueDestinations.length > 0 ? (
                            uniqueDestinations.map((dest, index) => (
                                <div key={index} className="dest-card" onClick={() => navigate(`/destinations/${dest.name}${context ? `?context=${context}` : ''}`)}>
                                    <div className="dest-img">
                                        <img src={dest.image} alt={dest.name} onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2070'} />
                                    </div>
                                    <div className="dest-info">
                                        <h3>{dest.name}</h3>
                                        <div className="dest-location">
                                            <MapPin size={16} />
                                            <span>{dest.fullLocation}</span>
                                        </div>
                                        <p className="dest-desc">{dest.description.substring(0, 80)}...</p>
                                        <div className="dest-actions">
                                            <button className="btn-link">View Packages and Deals</button>
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
