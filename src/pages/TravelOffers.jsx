import { useNavigate } from 'react-router-dom';
import { Tag, Zap, Clock, MapPin, Star } from 'lucide-react';
import './TravelOffers.css';

const TravelOffers = () => {
    const navigate = useNavigate();

    const offers = [
        {
            id: 1,
            title: "Kerala Houseboat Special",
            desc: "Get 20% off on all Alleppey houseboats for bookings this week.",
            badge: "20% OFF",
            validUntil: "Jan 15, 2026",
            code: "KERALA20",
            image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000"
        },
        {
            id: 2,
            title: "Himalayan Adventure Pack",
            desc: "Book a 7-day Manali trip and get a free paragliding experience.",
            badge: "FREE ACTIVITY",
            validUntil: "Jan 20, 2026",
            code: "FLYHIGH",
            image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2000"
        },
        {
            id: 3,
            title: "Rajasthan Royale Deal",
            desc: "Luxury palace stay upgrade at no extra cost for Udaipur bookings.",
            badge: "FREE UPGRADE",
            validUntil: "Jan 12, 2026",
            code: "ROYALTY",
            image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?q=80&w=2000"
        }
    ];

    return (
        <div className="offers-page">
            <header className="offers-hero">
                <div className="container">
                    <h1>Exclusive <span>Travel Offers</span></h1>
                    <p>Handpicked deals and limited-time discounts for your next adventure.</p>
                </div>
            </header>

            <div className="container">
                <div className="offers-grid">
                    {offers.map(offer => (
                        <div key={offer.id} className="offer-card glass-card">
                            <div className="offer-image">
                                <img src={offer.image} alt={offer.title} />
                                <div className="offer-badge">{offer.badge}</div>
                            </div>
                            <div className="offer-details">
                                <h3>{offer.title}</h3>
                                <p>{offer.desc}</p>
                                <div className="offer-meta">
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>Expires: {offer.validUntil}</span>
                                    </div>
                                    <div className="promo-code">
                                        <span>Code: <strong>{offer.code}</strong></span>
                                    </div>
                                </div>
                                <button className="btn btn-primary w-full" onClick={() => navigate('/packages')}>
                                    Claim This Offer
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="deals-banner reveal-visible">
                    <Zap size={32} className="pulse" />
                    <div className="banner-text">
                        <h2>Flash Sale: Flash 24-Hour Deals!</h2>
                        <p>Prices slashed by up to 40% for tonight's bookings.</p>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/packages')}>View Flash Deals</button>
                </div>
            </div>
        </div>
    );
};

export default TravelOffers;
