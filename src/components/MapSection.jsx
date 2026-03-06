import { MapPin } from 'lucide-react';
import './MapSection.css';

const MapSection = () => {
    return (
        <section className="map-section container reveal">
            <div className="section-header center">
                <h2 className="section-title">Explore <span>Without Limits</span></h2>
                <p>Track your favorite destinations and plan your route across Incredible India</p>
            </div>

            <div className="map-container-wrapper glass-card">
                <div className="map-overlay">
                    <div className="map-info-badge">
                        <MapPin size={16} className="pulse-icon" />
                        <span>70+ Destinations Linked</span>
                    </div>
                </div>

                <iframe
                    title="VistaVoyage Interactive Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15551.02!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&maptype=satellite"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(100%) invert(92%) contrast(83%)' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                <div className="map-stats-footer">
                    <div className="map-stat">
                        <strong>24/7</strong>
                        <span>Live Assistance</span>
                    </div>
                    <div className="map-stat">
                        <strong>Real-time</strong>
                        <span>Taxi Tracking</span>
                    </div>
                    <div className="map-stat">
                        <strong>Direct</strong>
                        <span>Hotel Booking</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MapSection;
