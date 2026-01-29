import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Calendar, Clock, Check, Star, Shield, Award, Users, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import ReviewSection from '../components/ReviewSection';
import StrictDate2026 from '../components/StrictDate2026';
import './PackageDetails.css';

const PackageDetails = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const context = searchParams.get('context');
    const urlDuration = searchParams.get('duration');
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState({
        travelDate: '2026-01-01',
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
    const [exclusiveHotels, setExclusiveHotels] = useState([]);
    const [exclusiveTaxis, setExclusiveTaxis] = useState([]);
    const [showHotelModal, setShowHotelModal] = useState(false);
    const [showTaxiModal, setShowTaxiModal] = useState(false);
    const [isLoadingHotels, setIsLoadingHotels] = useState(false);
    const [isLoadingTaxis, setIsLoadingTaxis] = useState(false);

    const [selectedDuration, setSelectedDuration] = useState(urlDuration || '');

    useEffect(() => {
        if (selectedDuration) {
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev);
                newParams.set('duration', selectedDuration);
                return newParams;
            }, { replace: true });
        }
    }, [selectedDuration, setSearchParams]);

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

        const days = (() => {
            const match = range.match(/(\d+)\s+Day/i);
            return match ? parseInt(match[1]) : parseInt(originalDuration) || 1;
        })();
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
                    'Authorization': `Bearer ${localStorage.getItem('token')} `
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
                    },
                    email: user?.email,
                    fullName: user?.name,
                    phone: user?.phone
                })
            });

            const data = await res.json();

            if (res.ok) {
                setBookingStatus({ type: 'success', message: 'Payment Successful! Booking confirmed. Redirecting...' });
                setTimeout(() => navigate('/my-bookings'), 2000);
            } else if (res.status === 401 || res.status === 403) {
                setBookingStatus({ type: 'error', message: 'Session expired. Please login again (new tab) and retry.' });
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
    const emergency = parseJSON(pkg.emergency_info, {});
    const accessibility = parseJSON(pkg.accessibility_info, {});

    const getVal = (key) => parseInt(bookingData[key]) || 0;
    const promoDiscount = discountType ? (1 - discountType.value) : 1.0;
    const totalPrice = Math.round(
        ((displayPrice * getVal('adults')) +
            (displayPrice * 0.95 * getVal('youngAdults')) +
            (displayPrice * 0.85 * getVal('teens')) +
            (displayPrice * 0.70 * getVal('kids')) +
            (displayPrice * 0.50 * getVal('infants'))) * promoDiscount
    );

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

                        <div className="services-showcase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                            <div className="service-box glass-card-hover" style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                padding: '25px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }} onClick={async () => {
                                setShowHotelModal(true);
                                setIsLoadingHotels(true);
                                try {
                                    const city = pkg.destination.split(',')[0].trim();
                                    const res = await fetch(`/api/hotels/city/${city}?exclusive=true`);
                                    const data = await res.json();
                                    setExclusiveHotels(data);
                                } catch (err) {
                                    console.error("Failed to load exclusive hotels", err);
                                } finally {
                                    setIsLoadingHotels(false);
                                }
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '10px', borderRadius: '12px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21V7l8-4 8 4v14M8 21V7M16 21V7"></path><polyline points="12 11 12 7 8 7"></polyline></svg>
                                    </div>
                                    <div style={{ background: '#2dd4bf', color: 'black', fontSize: '0.7rem', fontWeight: '800', padding: '4px 8px', borderRadius: '6px' }}>INCLUDED</div>
                                </div>
                                <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1.2rem' }}>Premium Stays</h4>
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>4★ & 5★ Hotels selected for your comfort in {pkg.destination.split(',')[0]}.</p>
                                <span style={{ color: '#2dd4bf', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    View Included Options →
                                </span>
                            </div>

                            <div className="service-box glass-card-hover" style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                padding: '25px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }} onClick={async () => {
                                setShowTaxiModal(true);
                                setIsLoadingTaxis(true);
                                try {
                                    const city = pkg.destination.split(',')[0].trim();
                                    const res = await fetch(`/api/taxis/city/${city}?exclusive=true`);
                                    const data = await res.json();
                                    setExclusiveTaxis(data);
                                } catch (err) {
                                    console.error("Failed to load exclusive taxis", err);
                                } finally {
                                    setIsLoadingTaxis(false);
                                }
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '10px', borderRadius: '12px' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                                    </div>
                                    <div style={{ background: '#2dd4bf', color: 'black', fontSize: '0.7rem', fontWeight: '800', padding: '4px 8px', borderRadius: '6px' }}>INCLUDED</div>
                                </div>
                                <h4 style={{ color: 'white', margin: '0 0 5px 0', fontSize: '1.2rem' }}>Luxury Travel</h4>
                                <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>Private AC Sedan for airport transfers & local sightseeing.</p>
                                <span style={{ color: '#2dd4bf', fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    View Included Vehicle →
                                </span>
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
                                <div className="form-group-custom">
                                    <label>Trip Duration</label>
                                    <select
                                        value={selectedDuration}
                                        onChange={(e) => setSelectedDuration(e.target.value)}
                                        className="duration-select"
                                    >
                                        <option value={pkg.duration}>{pkg.duration} (Standard)</option>
                                        {["2 Days 1 Night", "3 Days 2 Nights", "4 Days 3 Nights", "5 Days 4 Nights", "6 Days 5 Nights", "7 Days 6 Nights"]
                                            .filter(range => range !== pkg.duration)
                                            .map(range => (
                                                <option key={range} value={range}>{range}</option>
                                            ))}
                                    </select>
                                </div>
                                <div className="form-group-custom">
                                    <label>Travel Date</label>
                                    <StrictDate2026
                                        value={bookingData.travelDate}
                                        onChange={handleBookingChange}
                                        className="form-control-custom"
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
                                    <div className={`status - message ${bookingStatus.type} `}>
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

            {/* Exclusive Hotels Modal */}
            {showHotelModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setShowHotelModal(false)}>
                    <div style={{
                        background: '#1e293b', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '800px',
                        maxHeight: '85vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <button style={{
                            position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                            color: 'white', fontSize: '1.5rem', cursor: 'pointer'
                        }} onClick={() => setShowHotelModal(false)}>×</button>

                        <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem' }}>Exclusive Stays for You</h2>
                        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
                            These premium properties are exclusively reserved for our package guests in {pkg.destination.split(',')[0]}.
                        </p>

                        {isLoadingHotels ? (
                            <div style={{ color: 'var(--primary)', textAlign: 'center', padding: '40px' }}>Loading exclusive stays...</div>
                        ) : exclusiveHotels.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                {exclusiveHotels.slice(0, 1).map((hotel, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ height: '200px', overflow: 'hidden' }}>
                                            <img src={hotel.image} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span style={{
                                                    background: 'rgba(45, 212, 191, 0.2)', color: '#2DD4BF',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                                }}>{hotel.type}</span>
                                                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {hotel.rating}</span>
                                            </div>
                                            <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '5px' }}>{hotel.name}</h3>
                                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>{hotel.location}</p>

                                            <p style={{
                                                color: '#cbd5e1',
                                                fontSize: '0.85rem',
                                                lineHeight: '1.6',
                                                marginBottom: '20px',
                                                borderTop: '1px solid rgba(255,255,255,0.1)',
                                                paddingTop: '15px'
                                            }}>
                                                Experience world-class hospitality at <strong>{hotel.name}</strong>. Nestled near {hotel.location}, this {hotel.type || 'premium'} retreat offers stunning views and top-tier comfort.
                                                Rated {hotel.rating} stars, it provides the perfect sanctuary to relax after exploring {pkg.destination.split(',')[0]}.
                                            </p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                                                {hotel.amenities && hotel.amenities.slice(0, 3).map((am, i) => (
                                                    <span key={i} style={{
                                                        fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.1)',
                                                        padding: '4px 8px', borderRadius: '4px'
                                                    }}>{am}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <p>No exclusive properties listed for this location yet.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Rest assured, we will book a 4★+ Rated partner hotel.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Exclusive Taxis Modal */}
            {showTaxiModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setShowTaxiModal(false)}>
                    <div style={{
                        background: '#1e293b', padding: '40px', borderRadius: '24px', width: '90%', maxWidth: '800px',
                        maxHeight: '85vh', overflowY: 'auto', position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                    }} onClick={e => e.stopPropagation()}>
                        <button style={{
                            position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
                            color: 'white', fontSize: '1.5rem', cursor: 'pointer'
                        }} onClick={() => setShowTaxiModal(false)}>×</button>

                        <h2 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem' }}>Included Premium Travel</h2>
                        <p style={{ color: '#9ca3af', marginBottom: '30px' }}>
                            Your package includes premium airport transfers and local sightseeing in {pkg.destination.split(',')[0]} with these vehicles.
                        </p>

                        {isLoadingTaxis ? (
                            <div style={{ color: 'var(--primary)', textAlign: 'center', padding: '40px' }}>Loading vehicle details...</div>
                        ) : exclusiveTaxis.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                {exclusiveTaxis.slice(0, 1).map((taxi, idx) => (
                                    <div key={idx} style={{
                                        background: 'rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <div style={{ height: '200px', overflow: 'hidden' }}>
                                            <img src={taxi.image} alt={taxi.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span style={{
                                                    background: 'rgba(45, 212, 191, 0.2)', color: '#2DD4BF',
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                                }}>{taxi.city}</span>
                                                <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>★ {taxi.rating}</span>
                                            </div>
                                            <h3 style={{ color: 'white', fontSize: '1.2rem', marginBottom: '5px' }}>{taxi.type}</h3>
                                            <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '15px' }}>{taxi.capacity} Seater Capacity</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '15px' }}>
                                                {taxi.features && taxi.features.slice(0, 3).map((feat, i) => (
                                                    <span key={i} style={{
                                                        fontSize: '0.8rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.1)',
                                                        padding: '4px 8px', borderRadius: '4px'
                                                    }}>{feat}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                                <p>Vehicle details are currently being updated.</p>
                                <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Rest assured, a Premium AC Sedan or SUV will be provided.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PackageDetails;
