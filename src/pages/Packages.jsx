import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Clock, Filter, ShieldCheck, Leaf, Star, Zap, ChevronRight, LayoutGrid, List, SortAsc, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FavoriteButton from '../components/FavoriteButton';
import './PackagesV2.css';

const Packages = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    // Filters State
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedMood, setSelectedMood] = useState('All');
    const [budgetRange, setBudgetRange] = useState(100000);
    const [selectedDuration, setSelectedDuration] = useState('All');
    const [sortBy, setSortBy] = useState('featured');

    const moods = [
        { name: 'All', emoji: '🌟' },
        { name: 'Nature', emoji: '🌿' },
        { name: 'Adventure', emoji: '🧗' },
        { name: 'Relax', emoji: '😌' },
        { name: 'Romantic', emoji: '😍' },
        { name: 'Spiritual', emoji: '🛕' }
    ];

    const durations = ['All', '2 Days 1 Night', '3 Days 2 Nights', '5 Days 4 Nights', '7 Days 6 Nights'];

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const res = await fetch('/api/packages');
                const data = await res.json();
                setPackages(data);
            } catch (err) {
                console.error("Failed to fetch packages", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, []);

    // High Performance Filtering with useMemo
    const filteredPackages = useMemo(() => {
        let temp = [...packages];

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            temp = temp.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.destination.toLowerCase().includes(query) ||
                (p.mood_tags || "").toLowerCase().includes(query)
            );
        }

        if (selectedMood !== 'All') {
            const query = selectedMood.toLowerCase();
            temp = temp.filter(p => (p.mood_tags || "").toLowerCase().includes(query));
        }

        temp = temp.filter(p => parseFloat(p.price) <= budgetRange);

        if (selectedDuration !== 'All') {
            // Extract the number of days from the new format (e.g., "1 Day 2 Nights" -> 1)
            const extractDays = (duration) => {
                const match = duration.match(/(\d+)\s+Day/i);
                return match ? parseInt(match[1]) : 0;
            };

            temp = temp.filter(p => {
                const packageDays = extractDays(p.duration);

                // Match based on day ranges
                if (selectedDuration === '1 Day 2 Nights') {
                    return packageDays >= 1 && packageDays <= 2;
                } else if (selectedDuration === '2 Days 3 Nights') {
                    return packageDays >= 2 && packageDays <= 4;
                } else if (selectedDuration === '4 Days 5 Nights') {
                    return packageDays >= 4 && packageDays <= 6;
                } else if (selectedDuration === '6 Days 7 Nights') {
                    return packageDays >= 6;
                }

                return true;
            });
        }

        // Sorting Logic
        if (sortBy === 'price-low') temp.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') temp.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') temp.sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0));

        return temp;
    }, [packages, searchTerm, selectedMood, budgetRange, selectedDuration, sortBy]);

    // Helper function to format duration with box style
    const formatDurationWithIcons = (duration) => {
        const daysMatch = duration.match(/(\d+)\s+Day/i);
        const nightsMatch = duration.match(/(\d+)\s+Night/i);
        const days = daysMatch ? daysMatch[1] : '0';
        const nights = nightsMatch ? nightsMatch[1] : '0';

        return (
            <div style={{
                border: '1px solid #2DD4BF',
                borderRadius: '20px',
                padding: '5px 15px',
                color: '#2DD4BF',
                fontSize: '0.8rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'inline-block',
                backgroundColor: 'rgba(45, 212, 191, 0.05)'
            }}>
                {days} DAYS {nights} {nights === '1' ? 'NIGHT' : 'NIGHTS'}
            </div>
        );
    };

    const handleDealClick = (id) => {
        // FAST PREFETCH: We could prefetch data here, but navigation is already fast
        if (selectedDuration !== 'All') {
            navigate(`/packages/${id}?duration=${encodeURIComponent(selectedDuration.toLowerCase())}`);
        } else {
            navigate(`/packages/${id}`);
        }
    };

    return (
        <div className="packages-page">
            {/* Minimalist Premium Hero */}
            <header className="packages-header-hero">
                <div className="container">
                    <h2 style={{ display: 'none' }}>DEBUG: V3 ACTIVE</h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hero-badge-alt"
                    >
                        🎯 Exclusive Deals for You
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Unforgettable <span>Experiences</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Browse 70+ curated Indian destinations with smart safety checks
                    </motion.p>
                </div>
            </header>

            <div className="container main-layout">
                {/* Unified Search & Control Bar */}
                <div className="search-control-bar glass-card">
                    <div className="search-main">
                        <Search className="icon-p" />
                        <input
                            type="text"
                            placeholder="Find your vibe (e.g. Kashmir, Treks)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="controls-group">
                        <div className="budget-control">
                            <div className="budget-label">
                                <span>Max Budget</span>
                                <strong>₹{budgetRange.toLocaleString()}</strong>
                            </div>
                            <input
                                type="range"
                                min="5000"
                                max="100000"
                                step="5000"
                                value={budgetRange}
                                onChange={(e) => setBudgetRange(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="v-divider"></div>

                        <div className="view-mode-toggle">
                            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LayoutGrid size={18} /></button>
                            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><List size={18} /></button>
                        </div>
                    </div>
                </div>

                {/* Mood Quick Filters */}
                <div className="mood-chips-scroll">
                    {moods.map(mood => (
                        <button
                            key={mood.name}
                            className={`mood-chip-v2 ${selectedMood === mood.name ? 'active' : ''}`}
                            onClick={() => setSelectedMood(mood.name)}
                        >
                            <span className="chip-emoji">{mood.emoji}</span>
                            {mood.name}
                        </button>
                    ))}
                </div>

                <div className="results-container">
                    {/* Collapsible/Sticky Sidebar */}
                    <aside className="packages-sidebar">
                        <div className="sidebar-section">
                            <h3><Filter size={16} /> Filters</h3>
                            <div className="sort-group">
                                <label>Sort By</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Safety Rating</option>
                                </select>
                            </div>
                        </div>

                        <div className="sidebar-section">
                            <label>Duration</label>
                            <div className="duration-grid">
                                {durations.map(d => (
                                    <button
                                        key={d}
                                        className={selectedDuration === d ? 'active' : ''}
                                        onClick={() => setSelectedDuration(d)}
                                    >
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="smart-alert-card">
                            <Zap size={20} className="pulse" />
                            <h4>Flash Sale!</h4>
                            <p>Extra 10% off on all Kerala Houseboats. Ends in 4h.</p>
                            <div className="timer">03h 59m 44s</div>
                        </div>
                    </aside>

                    {/* Main Packages Display */}
                    <main className="packages-feed">
                        {loading ? (
                            <div className="loading-grid">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="skeleton-card glass-card"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="feed-header">
                                    <p>Found <strong>{filteredPackages.length}</strong> stunning adventures</p>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    <motion.div
                                        layout
                                        className={viewMode === 'grid' ? 'packages-grid-v2' : 'packages-list-v2'}
                                    >
                                        {filteredPackages.length > 0 ? (
                                            filteredPackages.map((pkg, idx) => (
                                                <motion.div
                                                    layout
                                                    key={pkg.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                                    // Card V2 Update
                                                    className="minimal-card v2-update"
                                                    onClick={() => handleDealClick(pkg.id)}
                                                >
                                                    <img
                                                        src={pkg.image_url}
                                                        alt={pkg.title}
                                                        className="card-image"
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                                                        }}
                                                    />

                                                    <div style={{
                                                        padding: '24px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        flexGrow: 1,
                                                        color: '#F3F4F6',
                                                        gap: '16px'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '16px',
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#e5e7eb',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {formatDurationWithIcons(pkg.duration)}
                                                        </div>

                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            color: 'white',
                                                            fontWeight: '700',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}>
                                                            <span>₹{pkg.price.toLocaleString()}</span>
                                                            <span>Per Person</span>
                                                        </div>

                                                        <h3 style={{
                                                            fontSize: '1.4rem',
                                                            fontWeight: '800',
                                                            margin: 0,
                                                            color: 'white',
                                                            lineHeight: '1.2'
                                                        }}>{pkg.title}</h3>

                                                        <p style={{
                                                            fontSize: '0.9rem',
                                                            color: '#9CA3AF',
                                                            lineHeight: '1.6',
                                                            marginBottom: 'auto'
                                                        }}>
                                                            Includes visiting {pkg.destination} and nearby attractions.
                                                        </p>

                                                        <button style={{
                                                            marginTop: '10px',
                                                            width: 'fit-content',
                                                            padding: 0,
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: '#2DD4BF', // Primary Teal
                                                            fontWeight: '700',
                                                            fontSize: '0.95rem',
                                                            cursor: 'pointer',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            CHOOSE THIS PLAN →
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="empty-state glass-card">
                                                <div className="empty-icon">🗺️</div>
                                                <h3>No matches found</h3>
                                                <p>Try broadening your search or resetting filters.</p>
                                                <button className="btn-reset" onClick={() => {
                                                    setSearchTerm('');
                                                    setSelectedMood('All');
                                                    setBudgetRange(100000);
                                                    setSelectedDuration('All');
                                                }}>Reset All Filters</button>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Packages;
