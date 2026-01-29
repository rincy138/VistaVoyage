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


                {/* Mood Quick Filters */}


                <div className="results-container">
                    {/* Collapsible/Sticky Sidebar */}


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
                                                    // Card V3 Update: Minimalist Dark Theme (Forced Refresh)
                                                    className="minimal-card v3-update"
                                                    onClick={() => handleDealClick(pkg.id)}
                                                    style={{
                                                        background: '#1e293b', // Slate 800 - Keeping existing theme
                                                        borderRadius: '16px',
                                                        overflow: 'hidden',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                                    }}
                                                >
                                                    <div style={{ position: 'relative', height: '220px' }}>
                                                        <img
                                                            src={pkg.image_url}
                                                            alt={pkg.title}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                            loading="lazy"
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
                                                            {pkg.duration ? pkg.duration.toUpperCase() : '5 DAYS 4 NIGHTS'}
                                                        </div>
                                                    </div>

                                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '0px', flexGrow: 1 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                            <h3 style={{
                                                                fontSize: '1.4rem',
                                                                fontWeight: '800',
                                                                margin: '0',
                                                                color: 'white'
                                                            }}>{pkg.title}</h3>
                                                            <span style={{
                                                                background: '#065f46',
                                                                color: '#34d399',
                                                                padding: '4px 8px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 'bold'
                                                            }}>{pkg.safety_score || '4.8'}/5</span>
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
                                                            {pkg.description || `Experience the best of ${pkg.destination} with our curated premium itinerary.`}
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
                                                                    items = typeof pkg.inclusions === 'string'
                                                                        ? JSON.parse(pkg.inclusions)
                                                                        : (Array.isArray(pkg.inclusions) ? pkg.inclusions : []);
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
                                                                {/* Price removed as requested */}
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
                                                                View Deal
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
