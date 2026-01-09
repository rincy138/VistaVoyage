import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, IndianRupee, Clock, Filter, ShieldCheck, Leaf, Star, Zap, ChevronRight, LayoutGrid, List, SortAsc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Packages.css';

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

    const durations = ['All', '1-2 Days', '3-4 Days', '5-7 Days', '7+ Days'];

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
            const count = parseInt(selectedDuration);
            if (selectedDuration.includes('+')) {
                temp = temp.filter(p => parseInt(p.duration) >= count);
            } else {
                const [min, max] = selectedDuration.split('-').map(n => parseInt(n));
                temp = temp.filter(p => {
                    const d = parseInt(p.duration);
                    return d >= min && d <= (max || min);
                });
            }
        }

        // Sorting Logic
        if (sortBy === 'price-low') temp.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') temp.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') temp.sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0));

        return temp;
    }, [packages, searchTerm, selectedMood, budgetRange, selectedDuration, sortBy]);

    const handleDealClick = (id) => {
        // FAST PREFETCH: We could prefetch data here, but navigation is already fast
        navigate(`/packages/${id}`);
    };

    return (
        <div className="packages-page">
            {/* Minimalist Premium Hero */}
            <header className="packages-header-hero">
                <div className="container">
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
                                                    className="deal-card glass-card"
                                                    onClick={() => handleDealClick(pkg.id)}
                                                >
                                                    <div className="deal-image">
                                                        <img src={pkg.image_url} alt={pkg.title} loading="lazy" />
                                                        <div className="deal-tags">
                                                            {pkg.price < 15000 && <span className="tag-save">SAVE ₹2000</span>}
                                                            <span className="tag-mood">{(pkg.mood_tags || "Travel").split(',')[0]}</span>
                                                        </div>
                                                        <div className="deal-safety">
                                                            <ShieldCheck size={14} /> {pkg.safety_score || '4.5'}
                                                        </div>
                                                    </div>
                                                    <div className="deal-content">
                                                        <div className="deal-header">
                                                            <h3>{pkg.title}</h3>
                                                            <div className="deal-price">
                                                                <span className="currency">₹</span>
                                                                <span className="amount">{pkg.price.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="deal-loc">
                                                            <MapPin size={14} /> {pkg.destination}
                                                        </div>
                                                        <div className="deal-info-row">
                                                            <span><Clock size={14} /> {pkg.duration}</span>
                                                            <span><Leaf size={14} /> {pkg.eco_score || 4}/5 Eco</span>
                                                        </div>
                                                        <div className="deal-footer">
                                                            <div className="rating-stars">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={12} fill={i < 4 ? "var(--primary)" : "none"} color="var(--primary)" />
                                                                ))}
                                                                <span>(120 reviews)</span>
                                                            </div>
                                                            <button className="book-btn-minimal">
                                                                View <ChevronRight size={16} />
                                                            </button>
                                                        </div>
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
