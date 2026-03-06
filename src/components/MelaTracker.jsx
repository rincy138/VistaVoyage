import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Tag, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './MelaTracker.css';

const MelaTracker = () => {
    const [festivals, setFestivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFestivals = async () => {
            try {
                const response = await fetch('/api/festivals/upcoming');
                const data = await response.json();
                setFestivals(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching festivals:', error);
                setLoading(false);
            }
        };

        fetchFestivals();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleExplore = (location) => {
        const city = location.split(',')[0].trim();
        navigate(`/packages?search=${encodeURIComponent(city)}`);
    };

    if (loading) return null;
    if (festivals.length === 0) return null;

    return (
        <section className="mela-tracker-section">
            <div className="mela-section-header">
                <div className="header-title-group">
                    <Sparkles className="sparkle-icon" size={24} />
                    <h2>The Great Indian Mela Tracker</h2>
                </div>
                <p>Don't miss the vibrance! Explore upcoming festivals and local fairs across India.</p>
            </div>

            <div className="mela-grid">
                {festivals.map((mela, index) => (
                    <motion.div
                        key={mela.id}
                        className="mela-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="mela-image-wrapper">
                            <img
                                src={mela.image_url || '/agra.png'}
                                alt={mela.name}
                                onError={(e) => {
                                    e.target.src = '/agra.png';
                                }}
                            />
                            <div className="mela-type-badge">
                                <Tag size={12} />
                                {mela.type}
                            </div>
                        </div>

                        <div className="mela-content">
                            <div className="mela-date-line">
                                <Calendar size={14} />
                                <span>{formatDate(mela.start_date)} - {formatDate(mela.end_date)}</span>
                            </div>
                            <h3>{mela.name}</h3>
                            <div className="mela-location">
                                <MapPin size={14} />
                                <span>{mela.location}</span>
                            </div>
                            <p className="mela-desc">{mela.description}</p>

                            <button
                                className="mela-action-btn"
                                onClick={() => handleExplore(mela.location)}
                            >
                                Explore Trips <ChevronRight size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default MelaTracker;
