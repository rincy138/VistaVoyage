import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';
import './Packages.css';

const Packages = () => {
    const [searchParams] = useSearchParams();
    const [packages, setPackages] = useState([]);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        destination: searchParams.get('search') || '',
        maxPrice: ''
    });

    useEffect(() => {
        fetchPackages();
    }, []);

    useEffect(() => {
        filterPackages();
    }, [filters, packages]);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            setPackages(data);
            setFilteredPackages(data);
        } catch (err) {
            console.error("Failed to fetch packages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const filterPackages = () => {
        let temp = [...packages];

        if (filters.destination) {
            temp = temp.filter(pkg =>
                pkg.destination.toLowerCase().includes(filters.destination.toLowerCase()) ||
                pkg.title.toLowerCase().includes(filters.destination.toLowerCase()) ||
                pkg.description.toLowerCase().includes(filters.destination.toLowerCase())
            );
        }

        if (filters.maxPrice) {
            temp = temp.filter(pkg => parseFloat(pkg.price) <= parseFloat(filters.maxPrice));
        }

        setFilteredPackages(temp);
    };

    return (
        <div className="packages-page">
            <div className="packages-hero">
                <div className="container">
                    <h1>Explore Top Deals</h1>
                    <p>Discover your next adventure with our curated travel packages</p>
                </div>
            </div>

            <div className="container">
                {/* Filter Section */}
                <div className="filter-section">
                    <div className="filter-group">
                        <label>Destination</label>
                        <div className="input-with-icon">
                            <MapPin size={20} className="input-icon" />
                            <input
                                type="text"
                                name="destination"
                                placeholder="Where do you want to go?"
                                className="form-control"
                                value={filters.destination}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>Max Price (₹)</label>
                        <div className="input-with-icon">
                            <DollarSign size={20} className="input-icon" />
                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Budget limit"
                                className="form-control"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                    <div className="filter-group" style={{ flex: 0 }}>
                        <button className="btn btn-primary" style={{ height: '48px', marginTop: '28px' }} onClick={filterPackages}>
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                {/* Packages Grid */}
                {loading ? (
                    <div className="loading-spinner">Loading awesome deals...</div>
                ) : (
                    <div className="packages-grid">
                        {filteredPackages.length > 0 ? (
                            filteredPackages.map(pkg => (
                                <div key={pkg.id} className="package-card">
                                    <div className="package-image">
                                        <img
                                            src={pkg.image_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070'}
                                            alt={pkg.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>
                                    <div className="package-content">
                                        <div className="package-header">
                                            <h3 className="package-title">{pkg.title}</h3>
                                            <span className="package-price">₹{pkg.price}</span>
                                        </div>
                                        <div className="package-meta">
                                            <span><MapPin size={16} /> {pkg.destination}</span>
                                            <span><Clock size={16} /> {pkg.duration}</span>
                                        </div>
                                        <p className="package-description">{pkg.description}</p>
                                        <button className="btn btn-primary" style={{ width: '100%' }}>View Deal</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <h3>No packages found matching your criteria.</h3>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Packages;
