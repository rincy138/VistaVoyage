import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';
import './Hotels.css';

const Hotels = () => {
    const navigate = useNavigate();
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null); // For the booking modal
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [hotels, setHotels] = useState([]);
    const [bookingForm, setBookingForm] = useState({
        checkIn: '',
        guests: 1,
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await axios.get('/api/hotels');
                setHotels(res.data);
            } catch (err) {
                console.error('Error fetching hotels:', err);
            }
        };
        fetchHotels();
    }, []);

    const places = useMemo(() => {
        const uniqueCities = [...new Set(hotels.map(h => h.city))];
        return uniqueCities.map(city => {
            const cityHotels = hotels.filter(h => h.city === city);
            return {
                name: city,
                count: cityHotels.length,
                image: cityHotels[0]?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945'
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [hotels]);

    const filteredHotels = useMemo(() => {
        if (!selectedPlace) return [];
        return hotels.filter(hotel =>
            hotel.city === selectedPlace &&
            (hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                hotel.location.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [selectedPlace, searchTerm, hotels]);

    const filteredPlaces = useMemo(() => {
        if (selectedPlace) return [];
        return places.filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [places, searchTerm, selectedPlace]);

    const handleBookStay = (hotel) => {
        setBookingDetails(hotel);
        setBookingForm({
            checkIn: new Date().toISOString().split('T')[0],
            guests: 1,
            fullName: '',
            email: '',
            phone: '',
            address: ''
        });
        setIsConfirmed(false);
    };

    const confirmBooking = () => {
        setIsPaymentModalOpen(true);
    };

    const handleFinalBooking = async () => {
        setIsPaymentModalOpen(false);
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const priceVal = typeof bookingDetails.price === 'number'
                ? bookingDetails.price
                : parseInt(bookingDetails.price.replace(/[^\d]/g, ''));

            await axios.post('/api/bookings', {
                itemId: bookingDetails.id,
                itemType: 'Hotel',
                travelDate: bookingForm.checkIn,
                totalAmount: priceVal * bookingForm.guests,
                guests: bookingForm.guests,
                city: bookingDetails.city,
                fullName: bookingForm.fullName,
                email: bookingForm.email,
                phone: bookingForm.phone,
                location: bookingDetails.location
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsProcessing(false);
            setIsConfirmed(true);
            setTimeout(() => {
                setBookingDetails(null);
                setIsConfirmed(false);
            }, 3000);
        } catch (err) {
            console.error('Booking failed:', err);
            setIsProcessing(false);
        }
    };

    const formatPrice = (price) => {
        if (typeof price === 'string' && price.includes('₹')) return price;
        return `₹${Number(price).toLocaleString()}`;
    };

    const calculateTotalAmount = () => {
        if (!bookingDetails) return 0;
        const priceVal = typeof bookingDetails.price === 'number'
            ? bookingDetails.price
            : parseInt(bookingDetails.price.replace(/[^\d]/g, ''));
        return priceVal * bookingForm.guests;
    };

    return (
        <div className="hotels-page">
            <header className="hotels-hero">
                <div className="container">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {selectedPlace ? `${selectedPlace} Stays` : 'Premium Stays'}
                    </motion.h1>
                    <p>
                        {selectedPlace
                            ? `Discover elite hotels and resorts in ${selectedPlace}.`
                            : 'Select a destination to explore handpicked luxury accommodations.'}
                    </p>

                    {selectedPlace && (
                        <button className="btn-back-places" onClick={() => { setSelectedPlace(null); setSearchTerm(''); }}>
                            <ArrowLeft size={18} /> Back to All Places
                        </button>
                    )}
                </div>
            </header>

            <div className="container">
                <AnimatePresence mode="wait">
                    {!selectedPlace ? (
                        <motion.div
                            key="places-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="places-grid"
                        >
                            {filteredPlaces.length > 0 ? (
                                filteredPlaces.map((place, idx) => (
                                    <motion.div
                                        key={place.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="place-card glass-card"
                                        onClick={() => setSelectedPlace(place.name)}
                                    >
                                        <div className="place-image">
                                            <img
                                                src={place.image}
                                                alt={place.name}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                                                }}
                                            />
                                            <div className="place-overlay">
                                                <h3>{place.name}</h3>
                                                <span>{place.count} {place.count === 1 ? 'Hotel' : 'Hotels'} <ChevronRight size={16} /></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="no-hotels-found">
                                    <span>🗺️</span>
                                    <h3>Destination not found</h3>
                                    <p>Try searching for another place or browse our list.</p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="hotels-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hotels-grid"
                        >
                            {filteredHotels.length > 0 ? (
                                filteredHotels.map(hotel => (
                                    <div key={hotel.id} className="hotel-card glass-card">
                                        <div className="hotel-image">
                                            <img
                                                src={hotel.image}
                                                alt={hotel.name}
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000';
                                                }}
                                            />
                                            <div className="favorite-action">
                                                <FavoriteButton itemId={hotel.id} itemType="Hotel" />
                                            </div>
                                            <div className="hotel-rating">
                                                <Star size={14} fill="currentColor" />
                                                <span>{hotel.rating}</span>
                                            </div>
                                            <div className="hotel-type-badge">{hotel.type}</div>
                                        </div>
                                        <div className="hotel-details">
                                            <div className="hotel-header">
                                                <h3>{hotel.name}</h3>
                                                <div className="hotel-price">{formatPrice(hotel.price)}<span>/night</span></div>
                                            </div>
                                            <div className="hotel-location">
                                                <MapPin size={16} />
                                                <span>{hotel.location}</span>
                                            </div>
                                            <div className="hotel-amenities">
                                                {hotel.amenities && hotel.amenities.slice(0, 3).map(item => (
                                                    <span key={item} className="amenity-tag">{item}</span>
                                                ))}
                                                {hotel.amenities && hotel.amenities.length > 3 && (
                                                    <span className="amenity-tag">+{hotel.amenities.length - 3} more</span>
                                                )}
                                            </div>
                                            <button className="btn btn-outline w-full" onClick={() => handleBookStay(hotel)}>
                                                Book Stay
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-hotels-found">
                                    <span>🏨</span>
                                    <h3>No matches in {selectedPlace}</h3>
                                    <p>Try a different hotel name or clear your search.</p>
                                    <button className="btn btn-secondary mt-4" onClick={() => setSearchTerm('')}>
                                        Clear Search
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {bookingDetails && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="booking-modal glass-card"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                        >
                            {!isConfirmed ? (
                                <>
                                    <div className="modal-header">
                                        <h2>Book your stay at {bookingDetails.name}</h2>
                                        <button className="close-btn" onClick={() => setBookingDetails(null)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="hotel-brief">
                                            <img src={bookingDetails.image} alt={bookingDetails.name} />
                                            <div>
                                                <p className="location"><MapPin size={14} /> {bookingDetails.location}</p>
                                                <p className="price">{formatPrice(bookingDetails.price)}<span> / night</span></p>
                                            </div>
                                        </div>

                                        <div className="booking-inputs">
                                            <div className="input-group">
                                                <label>Full Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter your full name"
                                                    value={bookingForm.fullName}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <div className="input-group">
                                                    <label>Email Address</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="email@example.com"
                                                        value={bookingForm.email}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        placeholder="Your phone number"
                                                        value={bookingForm.phone}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Home Address</label>
                                                <textarea
                                                    className="form-control"
                                                    placeholder="Enter your full address"
                                                    rows="2"
                                                    value={bookingForm.address}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div className="input-grid">
                                                <div className="input-group">
                                                    <label>Check-in Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={bookingForm.checkIn}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                        required
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Number of Guests</label>
                                                    <div className="guest-counter">
                                                        <button onClick={() => setBookingForm({ ...bookingForm, guests: Math.max(1, bookingForm.guests - 1) })}>-</button>
                                                        <span>{bookingForm.guests}</span>
                                                        <button onClick={() => setBookingForm({ ...bookingForm, guests: bookingForm.guests + 1 })}>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="booking-summary">
                                            <div className="summary-row">
                                                <span>Base Price</span>
                                                <span>{formatPrice(bookingDetails.price)}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Grand Total</span>
                                                <span>
                                                    {formatPrice((typeof bookingDetails.price === 'number' ? bookingDetails.price : parseInt(bookingDetails.price.replace(/[^\d]/g, ''))) * bookingForm.guests)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Balance Details Section */}
                                        <div className="hotel-balance-details">
                                            <div className="metrics-grid">
                                                <div className="metric-item">
                                                    <div className="metric-label">Safety Score</div>
                                                    <div className="metric-value">{bookingDetails.safety_score || '4.5'}/5.0</div>
                                                </div>
                                                <div className="metric-item">
                                                    <div className="metric-label">Crowd Level</div>
                                                    <div className="metric-value">{bookingDetails.crowd_level || 'Medium'}</div>
                                                </div>
                                                <div className="metric-item">
                                                    <div className="metric-label">Eco Score</div>
                                                    <div className="metric-value">
                                                        {[...Array(bookingDetails.eco_score || 4)].map((_, i) => (
                                                            <span key={i}>🌱</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="info-sections-grid">
                                                <div className="info-block accessibility">
                                                    <h4>Accessibility</h4>
                                                    <ul>
                                                        {bookingDetails.accessibility?.wheelchair && <li>♿ Wheelchair Accessible</li>}
                                                        {bookingDetails.accessibility?.elderly && <li>👵 Elderly Friendly</li>}
                                                        {!bookingDetails.accessibility?.wheelchair && <li className="text-muted">Limited Wheelchair Access</li>}
                                                    </ul>
                                                </div>
                                                <div className="info-block emergency">
                                                    <h4>Emergency Contacts</h4>
                                                    <p>🏥 {bookingDetails.emergency?.hospital || 'City Hospital'}</p>
                                                    <p>📞 Police: {bookingDetails.emergency?.police || '100'}</p>
                                                </div>
                                                {bookingDetails.festival && (
                                                    <div className="info-block festival">
                                                        <h4>Local Festival</h4>
                                                        <p>🎉 {bookingDetails.festival.event} ({bookingDetails.festival.month})</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={confirmBooking}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                                    </button>

                                    <div className="modal-divider"></div>
                                    <ReviewSection itemId={bookingDetails.id} itemType="Hotel" />
                                </>
                            ) : (
                                <div className="confirmation-screen">
                                    <div className="success-icon">✓</div>
                                    <h2>Payment Successful!</h2>
                                    <p>Your stay at <strong>{bookingDetails.name}</strong> has been reserved.</p>
                                    <p className="subtext">Booking Confirmed! Check your email for the voucher.</p>
                                    <button className="btn btn-outline" onClick={() => setBookingDetails(null)}>Close</button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleFinalBooking}
                amount={calculateTotalAmount()}
            />
        </div>
    );
};

export default Hotels;
