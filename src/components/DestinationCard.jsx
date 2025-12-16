import { MapPin } from 'lucide-react';
import './DestinationCard.css';

const DestinationCard = ({ destination }) => {
    const { title, location, image, price } = destination;

    return (
        <div className="destination-card">
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
