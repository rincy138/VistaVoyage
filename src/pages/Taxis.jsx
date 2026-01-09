import { useNavigate } from 'react-router-dom';
import { Car, Users, Shield, MapPin, Clock, Phone } from 'lucide-react';
import './Taxis.css';

const Taxis = () => {
    const navigate = useNavigate();

    const taxis = [
        {
            id: 1,
            type: "Sedan (Premium)",
            capacity: "4 People",
            pricePerKm: "₹15/km",
            features: ["AC", "Large Boot", "New Model"],
            image: "https://images.unsplash.com/photo-1549194388-f61be84a6e9e?q=80&w=2000"
        },
        {
            id: 2,
            type: "SUV (Luxury)",
            capacity: "6-7 People",
            pricePerKm: "₹22/km",
            features: ["Spacious", "Hill Assist", "Music System"],
            image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2000"
        },
        {
            id: 3,
            type: "Traveler (Group)",
            capacity: "12-16 People",
            pricePerKm: "₹35/km",
            features: ["AC", "Window Seats", "Carrier"],
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2000"
        }
    ];

    return (
        <div className="taxis-page">
            <header className="taxis-hero">
                <div className="container">
                    <h1>City <span>Transfers</span></h1>
                    <p>Reliable and safe taxi services for local and inter-city travel.</p>
                </div>
            </header>

            <div className="container">
                <div className="taxis-grid">
                    {taxis.map(taxi => (
                        <div key={taxi.id} className="taxi-card glass-card">
                            <div className="taxi-image">
                                <img src={taxi.image} alt={taxi.type} />
                            </div>
                            <div className="taxi-details">
                                <div className="taxi-header">
                                    <h3>{taxi.type}</h3>
                                    <div className="taxi-rate">{taxi.pricePerKm}</div>
                                </div>
                                <div className="taxi-capacity">
                                    <Users size={16} />
                                    <span>{taxi.capacity}</span>
                                </div>
                                <div className="taxi-features">
                                    {taxi.features.map(f => (
                                        <div key={f} className="feature-item">
                                            <Shield size={14} />
                                            <span>{f}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-primary w-full" onClick={() => navigate('/packages')}>
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="safety-info-card">
                    <Shield size={32} color="var(--primary)" />
                    <div className="safety-text">
                        <h3>Safe & Verified Drivers</h3>
                        <p>All our taxi partners undergo rigorous background checks and vehicle quality inspections for your peace of mind.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Taxis;
