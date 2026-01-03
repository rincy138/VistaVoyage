import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './DestinationCard.css';

const DestinationCard = ({ destination }) => {
    const { title, location, image, price } = destination;
    const navigate = useNavigate();

    // Extract city name for navigation
    const cityName = location.split(',')[0].trim();

    return (
        <div className="destination-card" onClick={() => navigate(`/destinations/${cityName}`)}>
            <img src={image} alt={title} className="card-image" />
            <div className="card-overlay">
                <div className="card-content">
                    <div className="card-location">
                        <MapPin size={16} />
                        {location}
                    </div>
                    <h3 className="card-title">{title}</h3>
                    <div className="card-price">{price}</div>
                    <button className="btn btn-primary card-btn">View Details</button>
                </div>
            </div>
        </div>
    );
};

export default DestinationCard;
