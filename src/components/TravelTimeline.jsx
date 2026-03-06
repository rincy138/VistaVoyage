import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Globe, Map, Compass, Calendar, CheckCircle2 } from 'lucide-react';
import './TravelTimeline.css';

const TravelTimeline = () => {
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('/api/users/milestones', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMilestones(res.data);
            } catch (err) {
                console.error('Error fetching milestones:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMilestones();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'First Solo Trip': return <User className="milestone-icon" />;
            case 'Island Discovery': return <Globe className="milestone-icon" />;
            case 'Longest Trip': return <Map className="milestone-icon" />;
            case 'Most Adventurous Trip': return <Compass className="milestone-icon" />;
            default: return <CheckCircle2 className="milestone-icon" />;
        }
    };

    if (loading) return <div className="timeline-loading">Mapping your milestones...</div>;

    return (
        <div className="travel-timeline">
            <h2>Your Travel Life Timeline</h2>
            {milestones.length > 0 ? (
                <div className="timeline-container">
                    {milestones.map((m, idx) => (
                        <motion.div
                            key={idx}
                            className="timeline-item"
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                        >
                            <div className="timeline-dot-wrapper">
                                <div className="timeline-dot">
                                    {getIcon(m.type)}
                                </div>
                                {idx < milestones.length - 1 && <div className="timeline-line"></div>}
                            </div>

                            <div className={`timeline-card ${idx % 2 === 0 ? 'left' : 'right'}`}>
                                <div className="card-header">
                                    <span className="milestone-date">
                                        <Calendar size={14} /> {new Date(m.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                    <span className="milestone-type">{m.type}</span>
                                </div>
                                <h3>{m.title}</h3>
                                <div className="milestone-badge">
                                    <Award size={14} /> Achieved
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="empty-timeline">
                    <Compass size={64} className="ghost-icon" />
                    <h3>No milestones yet</h3>
                    <p>Book your first adventure to start your travel life timeline!</p>
                </div>
            )}
        </div>
    );
};

// Internal icon helper to avoid duplicate imports
const Award = ({ size }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
);

export default TravelTimeline;
