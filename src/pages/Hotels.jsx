import { useNavigate } from 'react-router-dom';
import { Hotel, Star, MapPin, CheckCircle, Coffee, Wifi } from 'lucide-react';
import './Hotels.css';

const Hotels = () => {
    const navigate = useNavigate();

    const hotels = [
        {
            id: 1,
            name: "The Grand Palace",
            location: "Udaipur, Rajasthan",
            rating: 5,
            price: "₹18,000",
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000",
            amenities: ["Spa", "Pool", "Wifi"]
        },
        {
            id: 2,
            name: "Misty Mountain Resort",
            location: "Munnar, Kerala",
            rating: 4.5,
            price: "₹8,500",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000",
            amenities: ["Breakfast", "View", "Gym"]
        },
        {
            id: 3,
            name: "Beachside Bliss",
            location: "North Goa",
            rating: 4,
            price: "₹12,000",
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000",
            amenities: ["Bar", "Private Beach", "AC"]
        }
    ];

    return (
        <div className="hotels-page">
            <header className="hotels-hero">
                <div className="container">
                    <h1>Premium <span>Stays</span></h1>
                    <p>Discover the finest hotels and resorts for your dream vacation.</p>
                </div>
            </header>

            <div className="container">
                <div className="hotels-grid">
                    {hotels.map(hotel => (
                        <div key={hotel.id} className="hotel-card glass-card">
                            <div className="hotel-image">
                                <img src={hotel.image} alt={hotel.name} />
                                <div className="hotel-rating">
                                    <Star size={14} fill="currentColor" />
                                    <span>{hotel.rating}</span>
                                </div>
                            </div>
                            <div className="hotel-details">
                                <div className="hotel-header">
                                    <h3>{hotel.name}</h3>
                                    <div className="hotel-price">{hotel.price}<span>/night</span></div>
                                </div>
                                <div className="hotel-location">
                                    <MapPin size={16} />
                                    <span>{hotel.location}</span>
                                </div>
                                <div className="hotel-amenities">
                                    {hotel.amenities.map(item => (
                                        <span key={item} className="amenity-tag">{item}</span>
                                    ))}
                                </div>
                                <button className="btn btn-outline w-full" onClick={() => navigate('/destinations?context=hotel')}>
                                    Book Stay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hotels;
