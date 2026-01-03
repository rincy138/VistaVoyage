import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, CheckCircle, ShieldCheck } from 'lucide-react';
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

    return (
        <div className="package-details-page">
            <div className="package-hero-detailed">
                <img src={pkg.image_url} alt={pkg.title} />
                <div className="hero-overlay">
                    <div className="container hero-content-inner">
                        <h1>{pkg.title}</h1>
                        <div className="hero-meta">
                            <span><MapPin size={22} /> {pkg.destination}</span>
                            <span><Clock size={22} /> {pkg.duration}</span>
                            <span><Users size={22} /> Max {pkg.available_slots} slots</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="details-grid">
                    <div className="details-main">
                        <div className="details-section">
                            <h2>Expert Insight</h2>
                            <p>{pkg.description}</p>
                        </div>

                        <div className="details-section">
                            <h2>The Experience</h2>
                            <div className="itinerary-list">
                                <div className="itinerary-item">
                                    <div className="day-badge">Day 1</div>
                                    <div className="itinerary-content">
                                        <h4>Arrival & Orientation</h4>
                                        <p>Check-in to your luxury stay and enjoy a local orientation tour. Experience the first taste of local cuisine with a welcome dinner.</p>
                                    </div>
                                </div>
                                <div className="itinerary-item">
                                    <div className="day-badge">Day 2</div>
                                    <div className="itinerary-content">
                                        <h4>Main Landmark Tour</h4>
                                        <p>Comprehensive guided tour of the major historical and cultural landmarks. Professional photography sessions included.</p>
                                    </div>
                                </div>
                                <div className="itinerary-item">
                                    <div className="day-badge">Day 3</div>
                                    <div className="itinerary-content">
                                        <h4>Local Secrets & Leisure</h4>
                                        <p>Explore hidden spots known only to locals. Afternoon free for personal exploration or shopping for authentic crafts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="booking-sidebar">
                        <div className="booking-card">
                            <div className="booking-price">
                                <span className="label">Starts from</span>
                                <span className="value">₹{pkg.price}</span>
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

                                {bookingStatus.message && (
                                    <div className={`status-message ${bookingStatus.type}`}>
                                        {bookingStatus.message}
                                    </div>
                                )}

                                <button type="submit" className="btn btn-primary btn-book">
                                    {user ? 'Book This Deal' : 'Login to Book'}
                                </button>
                            </form>

                            <div className="booking-features">
                                <div className="feature-item">
                                    <CheckCircle size={18} color="var(--primary)" />
                                    <span>Free cancellation up to 48h</span>
                                </div>
                                <div className="feature-item">
                                    <ShieldCheck size={18} color="var(--primary)" />
                                    <span>Verified Safe Travels</span>
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
