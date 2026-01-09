import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './PackageDetails.css';

const PackageDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const context = searchParams.get('context');
    const urlDuration = searchParams.get('duration');
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        travelDate: '',
        guests: 1
    });
    const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });

    const [selectedDuration, setSelectedDuration] = useState(urlDuration || '');

    useEffect(() => {
        if (pkg && !selectedDuration) {
            setSelectedDuration(pkg.duration);
        }
    }, [pkg]);

    // Safe Parsers
    const parseJSON = (str, fallback = []) => {
        try {
            return typeof str === 'string' ? JSON.parse(str) : (str || fallback);
        } catch (e) {
            return fallback;
        }
    };

    // Helper for duration adjustment
    const getAdjustedData = (originalPrice, originalDuration, itinerary, range) => {
        if (!range) return { price: originalPrice, itinerary };

        const days = parseInt(range.split('-')[1]) || parseInt(originalDuration) || 1;
        const basePrice = parseFloat(originalPrice);
        const originalDays = parseInt(originalDuration) || 1;

        // Adjust Price
        const perDay = basePrice / originalDays;
        const adjustedPrice = Math.round(perDay * days);

        // Adjust Itinerary
        const extraImages = [
            "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
            "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000"
        ];

        let adjustedItin = Array.isArray(itinerary) ? [...itinerary] : [];
        // Pad if needed
        if (adjustedItin.length < days) {
            for (let i = adjustedItin.length + 1; i <= days; i++) {
                adjustedItin.push({
                    day: i,
                    title: "Extended Exploration",
                    desc: "Special local experience added to your custom plan.",
                    image: extraImages[i % extraImages.length]
                });
            }
        }

        return {
            price: adjustedPrice,
            itinerary: adjustedItin.slice(0, days)
        };
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

        if (bookingData.guests > pkg.available_slots) {
            setBookingStatus({ type: 'error', message: `Only ${pkg.available_slots} slots available.` });
            return;
        }

        if (bookingData.guests < 1) {
            setBookingStatus({ type: 'error', message: 'At least 1 guest is required.' });
            return;
        }

        const { price: finalPrice } = getAdjustedData(pkg.price, pkg.duration, parseJSON(pkg.itinerary), selectedDuration);

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
                    totalAmount: finalPrice * bookingData.guests,
                    customDuration: selectedDuration
                })
            });

            const data = await res.json();

            if (res.ok) {
                setBookingStatus({ type: 'success', message: 'Booking confirmed! Redirecting to your trips...' });
                setTimeout(() => navigate('/my-bookings'), 2000);
            } else if (res.status === 401 || res.status === 403) {
                setBookingStatus({ type: 'error', message: 'Your session has expired. Redirecting to login...' });
                setTimeout(() => logout(), 2000);
            } else {
                setBookingStatus({ type: 'error', message: data.message || 'Booking failed. Please try again.' });
            }
        } catch (err) {
            setBookingStatus({ type: 'error', message: 'Server error. Please try again later.' });
        }
    };

    if (loading) return <div className="loading-spinner">Loading package details...</div>;
    if (!pkg) return null;

    const { price: displayPrice, itinerary } = getAdjustedData(pkg.price, pkg.duration, parseJSON(pkg.itinerary), selectedDuration);
    const inclusions = parseJSON(pkg.inclusions, []);
    const exclusions = parseJSON(pkg.exclusions, []);
    const emergency = parseJSON(pkg.emergency_info, { hospital: "N/A", police: "100", ambulance: "102" });
    const accessibility = parseJSON(pkg.accessibility_info, { wheelchair: true, elderly: true });

    const totalPrice = displayPrice * bookingData.guests;

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
                                <span><Clock size={20} /> {selectedDuration || pkg.duration}</span>
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
                            <h2>Expert Insight {(context || urlDuration) ? `- ${selectedDuration || pkg.duration} Plan` : ''}</h2>
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
                                    <span className="amount">{displayPrice}</span>
                                    <span className="unit">/ person</span>
                                </div>
                                {selectedDuration && <div className="duration-tag">{selectedDuration}</div>}
                            </div>

                            <form className="booking-form" onSubmit={handleBookingSubmit}>
                                {(context || urlDuration) && (
                                    <div className="form-group-custom">
                                        <label>Trip Duration</label>
                                        <select
                                            value={selectedDuration}
                                            onChange={(e) => setSelectedDuration(e.target.value)}
                                            className="duration-select"
                                        >
                                            <option value={pkg.duration}>{pkg.duration} (Standard)</option>
                                            {["1-2 days", "2-3 days", "3-4 days", "4-5 days", "5-6 days", "6-7 days", "7-8 days", "8-9 days", "9-10 days", "10-11 days", "11-12 days", "12-13 days", "13-14 days"]
                                                .filter(range => range !== pkg.duration)
                                                .map(range => (
                                                    <option key={range} value={range}>{range}</option>
                                                ))}
                                        </select>
                                    </div>
                                )}
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
