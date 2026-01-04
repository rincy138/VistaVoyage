import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './PackageDetails.css';

const PackageDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        travelDate: '',
        guests: 1
    });
    const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });

    // Safe Parsers
    const parseJSON = (str, fallback = []) => {
        try {
            return typeof str === 'string' ? JSON.parse(str) : (str || fallback);
        } catch (e) {
            return fallback;
        }
    };

    useEffect(() => {
        const fetchPackage = async () => {
            try {
                const res = await fetch(`/api/packages/${id}`);
                if (!res.ok) throw new Error("Package not found");
                const data = await res.json();
                setPkg(data);
            } catch (err) {
                console.error("Error fetching package:", err);
                navigate('/packages');
            } finally {
                setLoading(false);
            }
        };
        fetchPackage();
    }, [id, navigate]);

    const handleBookingChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setBookingStatus({ type: 'info', message: 'Processing your booking...' });

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    packageId: id,
                    travelDate: bookingData.travelDate,
                    totalAmount: pkg.price * bookingData.guests
                })
            });

            const data = await res.json();

            if (res.ok) {
                setBookingStatus({ type: 'success', message: 'Booking confirmed! Redirecting to your trips...' });
                setTimeout(() => navigate('/my-bookings'), 2000);
            } else {
                setBookingStatus({ type: 'error', message: data.message || 'Booking failed. Please try again.' });
            }
        } catch (err) {
            setBookingStatus({ type: 'error', message: 'Server error. Please try again later.' });
        }
    };

    if (loading) return <div className="loading-spinner">Loading package details...</div>;
    if (!pkg) return null;

    const itinerary = parseJSON(pkg.itinerary, []);
    const inclusions = parseJSON(pkg.inclusions, []);
    const exclusions = parseJSON(pkg.exclusions, []);
    const emergency = parseJSON(pkg.emergency_info, { hospital: "N/A", police: "100", ambulance: "102" });
    const accessibility = parseJSON(pkg.accessibility_info, { wheelchair: true, elderly: true });

    const totalPrice = pkg.price * bookingData.guests;

    return (
        <div className="package-details-page">
            <div className="package-hero-detailed">
                <img src={pkg.image_url} alt={pkg.title} />
                <div className="hero-overlay">
                    <div className="container hero-content-inner">
                        <div className="reveal-visible">
                            <span className="location-badge"><MapPin size={16} /> {pkg.destination}</span>
                            <h1>{pkg.title}</h1>
                            <div className="hero-meta">
                                <span><Clock size={20} /> {pkg.duration}</span>
                                <span><Users size={20} /> {pkg.available_slots} Slots Available</span>
                                <span><ShieldCheck size={20} /> Safety Score: {pkg.safety_score || '4.5'}/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="details-grid">
                    <div className="details-main">
                        <section className="details-section reveal-hidden">
                            <h2>Expert Insight</h2>
                            <p className="description-text">{pkg.description}</p>
                        </section>

                        <section className="details-section reveal-hidden">
                            <h2>The Experience</h2>
                            <div className="itinerary-list">
                                {itinerary.map((item, index) => (
                                    <div className="itinerary-item" key={index}>
                                        <div className="day-badge">Day {item.day}</div>
                                        <div className="itinerary-content">
                                            <h4>{item.title}</h4>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="info-cards-grid reveal-hidden">
                            <div className="info-card">
                                <h3><CheckCircle size={20} className="icon-success" /> Inclusions</h3>
                                <ul>
                                    {inclusions.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                            <div className="info-card">
                                <h3><AlertTriangle size={20} className="icon-warning" /> Exclusions</h3>
                                <ul>
                                    {exclusions.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            </div>
                        </div>

                        <section className="details-section safety-tips reveal-hidden">
                            <h2><ShieldCheck size={24} /> Safety & Local Support</h2>
                            <div className="safety-content">
                                <p>{pkg.safety_info || 'Standard safety protocols apply. Always follow local guidelines.'}</p>

                                <div className="detail-meta-blocks">
                                    <div className="emergency-box">
                                        <strong>🚑 Emergency Contacts:</strong>
                                        <ul>
                                            <li><span>Hospital:</span> {emergency.hospital}</li>
                                            <li><span>Police:</span> {emergency.police}</li>
                                            <li><span>Ambulance:</span> {emergency.ambulance}</li>
                                        </ul>
                                    </div>
                                    <div className="accessibility-box">
                                        <strong>♿ Accessibility:</strong>
                                        <ul>
                                            {accessibility.wheelchair && <li>Wheelchair Accessible</li>}
                                            {accessibility.elderly && <li>Elderly Friendly</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="booking-sidebar reveal-hidden">
                        <div className="booking-card glass-card">
                            <div className="booking-price-header">
                                <div className="price-tag">
                                    <span className="currency">₹</span>
                                    <span className="amount">{pkg.price}</span>
                                    <span className="unit">/ person</span>
                                </div>
                            </div>

                            <form className="booking-form" onSubmit={handleBookingSubmit}>
                                <div className="form-group-custom">
                                    <label>Travel Date</label>
                                    <input
                                        type="date"
                                        name="travelDate"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={bookingData.travelDate}
                                        onChange={handleBookingChange}
                                    />
                                </div>
                                <div className="form-group-custom">
                                    <label>Number of Guests</label>
                                    <div className="guest-selector">
                                        <input
                                            type="number"
                                            name="guests"
                                            min="1"
                                            max={pkg.available_slots}
                                            required
                                            value={bookingData.guests}
                                            onChange={handleBookingChange}
                                        />
                                    </div>
                                </div>

                                <div className="total-price-display">
                                    <span>Total Amount</span>
                                    <strong>₹{totalPrice.toLocaleString()}</strong>
                                </div>

                                {bookingStatus.message && (
                                    <div className={`status-message ${bookingStatus.type}`}>
                                        {bookingStatus.message}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary btn-book-large" disabled={loading}>
                                    {user ? 'Confirm & Book Now' : 'Login to Continue'}
                                </button>
                            </form>

                            <div className="trust-badges">
                                <div className="badge-item">
                                    <ShieldCheck size={16} />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="badge-item">
                                    <Clock size={16} />
                                    <span>Instant Confirmation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackageDetails;
