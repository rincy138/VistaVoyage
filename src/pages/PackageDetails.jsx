import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Clock, Users, Calendar, CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';
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
        adults: 1, // 40+
        youngAdults: 0, // 20-40
        teens: 0, // 10-20
        kids: 0, // 5-10
        infants: 0, // < 5
        promoCode: ''
    });
    const [discountType, setDiscountType] = useState(null);
    const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

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
            "https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2000",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000",
            "https://images.unsplash.com/photo-1512918766671-ad650b9b732d?q=80&w=2000",
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000"
        ];

        const extraTitles = ["Hidden Gems Showcase", "Local Market Discovery", "Leisure & Wellness", "Cultural Immersion"];
        const extraDescs = [
            "Venture off the beaten path to discover secret spots known only to locals.",
            "Explore the vibrant local markets and pick up unique handicrafts.",
            "A dedicated day for relaxation or taking part in optional wellness activities.",
            "Deep dive into the authentic traditions and lifestyle of the region."
        ];

        let adjustedItin = Array.isArray(itinerary) ? [...itinerary] : [];
        if (adjustedItin.length < days) {
            for (let i = adjustedItin.length + 1; i <= days; i++) {
                adjustedItin.push({
                    day: i,
                    title: extraTitles[i % extraTitles.length],
                    desc: extraDescs[i % extraDescs.length],
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

    // Intersection Observer removed to fix visibility issues

    const handleBookingChange = (e) => {
        setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    };

    const handleBookingSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        const calculateGuestsCount = () => {
            return Object.keys(bookingData)
                .filter(key => key !== 'travelDate')
                .reduce((sum, key) => sum + (parseInt(bookingData[key]) || 0), 0);
        };

        const guestsCount = calculateGuestsCount();

        if (guestsCount > pkg.available_slots) {
            setBookingStatus({ type: 'error', message: `Only ${pkg.available_slots} slots available.` });
            return;
        }

        if (guestsCount < 1) {
            setBookingStatus({ type: 'error', message: 'At least 1 guest is required.' });
            return;
        }

        setIsPaymentModalOpen(true);
    };

    const handleFinalBooking = async () => {
        setIsPaymentModalOpen(false);
        const { price: finalPrice } = getAdjustedData(pkg.price, pkg.duration, parseJSON(pkg.itinerary), selectedDuration);
        const getVal = (key) => parseInt(bookingData[key]) || 0;
        const promoDiscount = discountType ? (1 - discountType.value) : 1.0;
        const calculatedTotal =
            ((finalPrice * getVal('adults')) +
                (finalPrice * 0.95 * getVal('youngAdults')) +
                (finalPrice * 0.85 * getVal('teens')) +
                (finalPrice * 0.70 * getVal('kids')) +
                (finalPrice * 0.50 * getVal('infants'))) * promoDiscount;

        setBookingStatus({ type: 'info', message: 'Processing your booking...' });

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    itemId: id,
                    itemType: 'Package',
                    travelDate: bookingData.travelDate,
                    totalAmount: calculatedTotal,
                    guests: Object.keys(bookingData)
                        .filter(key => key !== 'travelDate' && key !== 'promoCode')
                        .reduce((sum, key) => sum + (parseInt(bookingData[key]) || 0), 0),
                    city: pkg.destination.split(',')[0].trim(),
                    customDuration: selectedDuration,
                    ageBreakdown: {
                        adults: bookingData.adults,
                        youngAdults: bookingData.youngAdults,
                        teens: bookingData.teens,
                        kids: bookingData.kids,
                        infants: bookingData.infants
                    }
                })
            });

            const data = await res.json();

            if (res.ok) {
                setBookingStatus({ type: 'success', message: 'Payment Successful! Booking confirmed. Redirecting...' });
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

    const getDisplayVal = (key) => parseInt(bookingData[key]) || 0;
    const promoDiscount = discountType ? (1 - discountType.value) : 1.0;
    const totalPrice =
        ((displayPrice * getDisplayVal('adults')) +
            (displayPrice * 0.95 * getDisplayVal('youngAdults')) +
            (displayPrice * 0.85 * getDisplayVal('teens')) +
            (displayPrice * 0.70 * getDisplayVal('kids')) +
            (displayPrice * 0.50 * getDisplayVal('infants'))) * promoDiscount;

    const handlePromoApply = () => {
        const code = bookingData.promoCode.toUpperCase();
        const dest = (pkg.destination || "").toLowerCase();

        if (code === 'KERALA20') {
            if (dest.includes('kerala')) {
                setDiscountType({ type: 'perc', value: 0.20 });
                setBookingStatus({ type: 'success', message: 'Kerala Special! 20% Discount applied.' });
            } else {
                setBookingStatus({ type: 'error', message: 'KERALA20 is only valid for destinations in Kerala.' });
            }
        } else if (code === 'FLYHIGH') {
            const adventureStates = ['himachal', 'uttarakhand', 'ladakh', 'sikkim', 'arunachal', 'kashmir'];
            const isAdventure = adventureStates.some(state => dest.includes(state));
            if (isAdventure) {
                setDiscountType({ type: 'perc', value: 0.15 });
                setBookingStatus({ type: 'success', message: 'Adventure Deal! 15% Discount applied.' });
            } else {
                setBookingStatus({ type: 'error', message: 'FLYHIGH is only valid for mountain & adventure destinations.' });
            }
        } else if (code === 'ROYALTY') {
            if (dest.includes('rajasthan')) {
                setDiscountType({ type: 'perc', value: 0.25 });
                setBookingStatus({ type: 'success', message: 'Royal Upgrade! 25% Discount applied.' });
            } else {
                setBookingStatus({ type: 'error', message: 'ROYALTY is only valid for destinations in Rajasthan.' });
            }
        } else {
            setDiscountType(null);
            setBookingStatus({ type: 'error', message: 'Invalid promo code.' });
        }
    };

    return (
        <div className="package-details-page">
            <div className="package-hero-detailed">
                <img
                    src={pkg.image_url}
                    alt={pkg.title}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                    }}
                />
                <div className="hero-overlay">
                    <div className="container hero-content-inner">
                        <div className="hero-static-content">
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
                <section className="details-section itinerary-section-standalone">
                    <div className="section-header-alt">
                        <h2>The <span>Experience</span></h2>
                        <p>A day-by-day breakdown of your journey through {pkg.destination}</p>
                    </div>
                    <div className="itinerary-grid">
                        {itinerary.map((item, index) => (
                            <motion.div
                                className="itinerary-card"
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <div className="card-image">
                                    <img
                                        src={item.image || "https://images.unsplash.com/photo-1593693397690-362ae9666ec2?q=80&w=2000"}
                                        alt={item.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000';
                                        }}
                                    />
                                </div>
                                <div className="itin-card-content">
                                    <div className="day-pill">DAY {item.day}</div>
                                    <h4>{item.title}</h4>
                                    <p>{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <div className="details-grid">
                    <div className="details-main">
                        <section className="details-section">
                            <h2>Expert Insight {(context || urlDuration) ? `- ${selectedDuration || pkg.duration} Plan` : ''}</h2>
                            <p className="description-text">{pkg.description}</p>
                        </section>


                        <div className="info-cards-grid">
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

                        <section className="details-section safety-tips">
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

                        <ReviewSection itemId={id} itemType="Package" />
                    </div>

                    <div className="booking-sidebar">
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

                                <div className="guest-selection-grid">
                                    <div className="form-group-custom">
                                        <label>Adults (40+)</label>
                                        <div className="guest-selector">
                                            <input type="number" name="adults" min="1" required value={bookingData.adults} onChange={handleBookingChange} />
                                        </div>
                                        <span className="price-note">Full Price</span>
                                    </div>
                                    <div className="form-group-custom">
                                        <label>Young (20-40)</label>
                                        <div className="guest-selector">
                                            <input type="number" name="youngAdults" min="0" required value={bookingData.youngAdults} onChange={handleBookingChange} />
                                        </div>
                                        <span className="price-note">5% Off</span>
                                    </div>
                                    <div className="form-group-custom">
                                        <label>Teens (10-20)</label>
                                        <div className="guest-selector">
                                            <input type="number" name="teens" min="0" required value={bookingData.teens} onChange={handleBookingChange} />
                                        </div>
                                        <span className="price-note">15% Off</span>
                                    </div>
                                    <div className="form-group-custom">
                                        <label>Kids (5-10)</label>
                                        <div className="guest-selector">
                                            <input type="number" name="kids" min="0" required value={bookingData.kids} onChange={handleBookingChange} />
                                        </div>
                                        <span className="price-note">30% Off</span>
                                    </div>
                                    <div className="form-group-custom">
                                        <label>Infants ({"<"}5)</label>
                                        <div className="guest-selector">
                                            <input type="number" name="infants" min="0" required value={bookingData.infants} onChange={handleBookingChange} />
                                        </div>
                                        <span className="price-note">50% Off</span>
                                    </div>
                                </div>

                                <div className="promo-section">
                                    <div className="form-group-custom">
                                        <label>Promo Code</label>
                                        <div className="promo-input-group">
                                            <input
                                                type="text"
                                                name="promoCode"
                                                placeholder="e.g. KERALA20"
                                                value={bookingData.promoCode}
                                                onChange={handleBookingChange}
                                                disabled={!!discountType}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-apply"
                                                onClick={handlePromoApply}
                                                disabled={!!discountType}
                                            >
                                                {discountType ? 'Applied' : 'Apply'}
                                            </button>
                                        </div>
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

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleFinalBooking}
                amount={totalPrice}
            />
        </div>
    );
};

export default PackageDetails;
