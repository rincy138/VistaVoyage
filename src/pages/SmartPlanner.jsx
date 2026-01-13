import { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, Clock, Users, Heart, Zap, Shield, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SmartPlanner.css';

const SmartPlanner = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        budget: 10000,
        days: 3,
        type: 'solo',
        interest: 'Nature'
    });
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        // Simulate "AI" logic by fetching packages and filtering based on user preferences
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();

            const results = data.filter(pkg => {
                const pkgBudget = pkg.price;
                const pkgMood = pkg.mood_tags || "";
                return (
                    pkgBudget <= (preferences.budget + 5000) &&
                    pkgMood.toLowerCase().includes(preferences.interest.toLowerCase())
                );
            });

            setRecommendations(results);
            setStep(3);
        } catch (err) {
            console.error("Planner Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="planner-page">
            <div className="container">
                <div className="planner-header">
                    <h1>Smart <span>Trip Planner</span></h1>
                    <p>Customize your AI-generated itinerary based on your preferences</p>
                </div>

                {step === 1 && (
                    <div className="planner-card glass-morphism">
                        <div className="step-count">Step 1 of 2</div>
                        <h3>Tell us your travel style</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Max Budget (₹)</label>
                                <input
                                    type="range"
                                    min="5000"
                                    max="100000"
                                    step="5000"
                                    value={preferences.budget}
                                    onChange={(e) => setPreferences({ ...preferences, budget: parseInt(e.target.value) })}
                                />
                                <div className="range-display">₹{preferences.budget.toLocaleString()}</div>
                            </div>
                            <div className="form-group">
                                <label>Number of Days</label>
                                <div className="toggle-group">
                                    {[2, 3, 5, 7].map(d => (
                                        <button
                                            key={d}
                                            className={preferences.days === d ? 'active' : ''}
                                            onClick={() => setPreferences({ ...preferences, days: d })}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setStep(2)}>Next Step</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="planner-card glass-morphism">
                        <div className="step-count">Step 2 of 2</div>
                        <h3>What do you vibe with?</h3>
                        <div className="interest-grid">
                            {['Nature', 'Adventure', 'Relax', 'Spiritual', 'Romantic'].map(i => (
                                <div
                                    key={i}
                                    className={`interest-card ${preferences.interest === i ? 'active' : ''}`}
                                    onClick={() => setPreferences({ ...preferences, interest: i })}
                                >
                                    <span className="interest-label">{i}</span>
                                </div>
                            ))}
                        </div>
                        <div className="action-buttons">
                            <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Itinerary'}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="results-section">
                        <div className="results-header">
                            <h2>Recommended for <span>You</span></h2>
                            <button className="btn-link" onClick={() => setStep(1)}>Start Over</button>
                        </div>
                        <div className="results-grid">
                            {recommendations.length > 0 ? recommendations.map(pkg => (
                                <div key={pkg.id} className="result-item glass-morphism">
                                    <div className="result-img">
                                        <img
                                            src={pkg.image_url}
                                            alt={pkg.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                                            }}
                                        />
                                        <div className="result-badge">{pkg.duration}</div>
                                    </div>
                                    <div className="result-content">
                                        <h4>{pkg.title}</h4>
                                        <div className="result-score">
                                            <Shield size={14} /> Safety: {pkg.safety_score}/5
                                            <Leaf size={14} className="ml-10" /> Eco: {pkg.eco_score}/5
                                        </div>
                                        <p>{pkg.description}</p>
                                        <div className="result-footer">
                                            <span className="result-price">₹{pkg.price}</span>
                                            <button className="btn btn-primary" onClick={() => navigate(`/destinations/${pkg.destination.split(',')[0]}`)}>
                                                View Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="no-packages glass-morphism">
                                    <p>No perfect matches found within this budget. Try increasing your budget slightly!</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartPlanner;
