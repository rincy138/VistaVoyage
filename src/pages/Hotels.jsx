import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [bookingForm, setBookingForm] = useState({
        checkIn: '',
        guests: 1,
        fullName: '',
        email: '',
        phone: '',
        address: ''
    });

    const hotels = [
        // --- MUNNAR ---
        { id: 1, name: "Blanket Hotel and Spa", location: "Attukad Falls, Munnar", city: "Munnar", type: "Mountain", rating: 5, price: "₹10,500", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000", amenities: ["Infinity Pool", "Waterfall View"], safety_score: 4.9, crowd_level: "Low", eco_score: 5, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "General Hospital", police: "100", ambulance: "102" }, festival: { event: "Flower Show", month: "January" } },
        { id: 2, name: "Fragrant Nature Munnar", location: "Pothamedu, Munnar", city: "Munnar", type: "Mountain", rating: 4.9, price: "₹9,800", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000", amenities: ["Fine Dining", "Yoga Deck"], safety_score: 4.8, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Tata Hospital", police: "100", ambulance: "102" } },
        { id: 3, name: "The Panoramic Getaway", location: "Chithirapuram, Munnar", city: "Munnar", type: "Mountain", rating: 4.8, price: "₹12,400", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000", amenities: ["Rooftop Pool", "Helipad"], safety_score: 4.7, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Nirmala Hospital", police: "100", ambulance: "102" } },
        { id: 4, name: "SpiceTree Munnar", location: "Chinnakanal, Munnar", city: "Munnar", type: "Mountain", rating: 4.7, price: "₹15,000", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000", amenities: ["Private Jacuzzi", "Tea Plantation"], safety_score: 4.9, crowd_level: "Low", eco_score: 5, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Munnar Clinic", police: "100", ambulance: "102" } },

        // --- GOA ---
        { id: 13, name: "ITC Grand Goa Resort", location: "Arossim Beach, Goa", city: "Goa", type: "Beach", rating: 5, price: "₹18,500", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=2000", amenities: ["Private Beach", "Village Style"], safety_score: 4.9, crowd_level: "High", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Apollo Victor", police: "100", ambulance: "102" } },
        { id: 14, name: "Taj Exotica Resort & Spa", location: "Benaulim, Goa", city: "Goa", type: "Beach", rating: 4.9, price: "₹16,200", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000", amenities: ["Golf Course", "Jiva Spa"], safety_score: 4.8, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Victor Hospital", police: "100", ambulance: "102" } },
        { id: 50, name: "W Goa", location: "Vagator Beach, Goa", city: "Goa", type: "Beach", rating: 4.8, price: "₹22,000", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000", amenities: ["Private Cabanas", "Sunset Bar"], safety_score: 4.7, crowd_level: "High", eco_score: 3, accessibility: { wheelchair: false, elderly: true }, emergency: { hospital: "Vrundavan Hospital", police: "100", ambulance: "102" } },

        // --- UDAIPUR ---
        { id: 15, name: "The Leela Palace", location: "Lake Pichola, Udaipur", city: "Udaipur", type: "Heritage", rating: 5, price: "₹28,000", image: "https://images.unsplash.com/photo-1549463387-92c21a1d1235?q=80&w=2000", amenities: ["Lake View", "Royal Decor"], safety_score: 4.9, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "GBH American", police: "100", ambulance: "102" } },
        { id: 16, name: "The Ananta Udaipur", location: "Kodiyat, Udaipur", city: "Udaipur", type: "Heritage", rating: 4.7, price: "₹9,500", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000", amenities: ["Mountain View", "Spa"], safety_score: 4.6, crowd_level: "High", eco_score: 3, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Paras Hospital", police: "100", ambulance: "102" } },
        { id: 51, name: "Taj Lake Palace", location: "Lake Pichola, Udaipur", city: "Udaipur", type: "Heritage", rating: 5, price: "₹45,000", image: "https://images.unsplash.com/photo-1590611380053-da643716d82b?q=80&w=2000", amenities: ["Floating Palace", "Boat Arrival"], safety_score: 5.0, crowd_level: "Low", eco_score: 5, accessibility: { wheelchair: false, elderly: true }, emergency: { hospital: "Udaipur Clinic", police: "100", ambulance: "102" } },

        // --- MANALI ---
        { id: 17, name: "The Himalayan", location: "Hadimba Rd, Manali", city: "Manali", type: "Mountain", rating: 4.8, price: "₹14,200", image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2000", amenities: ["Castle Stay", "Mountain Pool"], safety_score: 4.8, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Civil Hospital", police: "100", ambulance: "102" } },
        { id: 52, name: "Solang Valley Resort", location: "Solang, Manali", city: "Manali", type: "Mountain", rating: 4.6, price: "₹11,500", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000", amenities: ["River Side", "Adventure Hub"], safety_score: 4.5, crowd_level: "High", eco_score: 3, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Mission Hospital", police: "100", ambulance: "102" } },
        { id: 53, name: "Span Resort & Spa", location: "Kullu-Manali Hwy", city: "Manali", type: "Mountain", rating: 4.7, price: "₹16,000", image: "https://images.unsplash.com/photo-1551882547-ff43c61fe9b7?q=80&w=2000", amenities: ["Luxury Cottages", "Trout Fishing"], safety_score: 4.7, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Lady Willingdon", police: "100", ambulance: "102" } },

        // --- VARANASI ---
        { id: 23, name: "BrijRama Palace", location: "Darbhanga Ghat, Varanasi", city: "Varanasi", type: "Heritage", rating: 4.9, price: "₹24,500", image: "https://images.unsplash.com/photo-1561224737-268153600bef?q=80&w=2000", amenities: ["Ganges River View", "Historic Palace"], safety_score: 4.7, crowd_level: "High", eco_score: 4, accessibility: { wheelchair: false, elderly: true }, emergency: { hospital: "Heritage Hospital", police: "100", ambulance: "102" } },
        { id: 59, name: "Taj Nadesar Palace", location: "Nadesar, Varanasi", city: "Varanasi", type: "Heritage", rating: 5, price: "₹35,000", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000", amenities: ["Royal Suites", "Guided Tours"], safety_score: 4.9, crowd_level: "Low", eco_score: 5, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Sir Sunderlal", police: "100", ambulance: "102" } },

        // (Keeping others for mapping logic)
        { id: 26, name: "The Khyber Himalayan Resort", location: "Gulmarg Rd, Srinagar", city: "Srinagar", type: "Mountain", rating: 5, price: "₹25,800", image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000", amenities: ["Mountain Views", "Ski Access"], safety_score: 4.9, crowd_level: "Medium", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "SMHS Hospital", police: "100", ambulance: "102" } },
        { id: 29, name: "The Tamara Coorg", location: "Yevakapadi, Coorg", city: "Coorg", type: "Mountain", rating: 4.9, price: "₹19,800", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000", amenities: ["Plantation Walk", "Infinite Pool"], safety_score: 4.9, crowd_level: "Low", eco_score: 5, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Coorg Medical", police: "100", ambulance: "102" } },
        { id: 31, name: "Vythiri Resort", location: "Lakkidi, Wayanad", city: "Wayanad", type: "Mountain", rating: 4.7, price: "₹15,500", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000", amenities: ["Tree House", "Suspension Bridge"], safety_score: 4.6, crowd_level: "Medium", eco_score: 5, accessibility: { wheelchair: false, elderly: true }, emergency: { hospital: "Wayanad Clinic", police: "100", ambulance: "102" } },
        { id: 21, name: "Rambagh Palace", location: "Bhawani Singh Rd, Jaipur", city: "Jaipur", type: "Heritage", rating: 5, price: "₹72,000", image: "https://images.unsplash.com/photo-1590611380053-da643716d82b?q=80&w=2000", amenities: ["Royal Gardens", "Heritage Decor"], safety_score: 5.0, crowd_level: "Medium", eco_score: 5, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Fortis Jaipur", police: "100", ambulance: "102" } },
        { id: 40, name: "The Taj Mahal Palace", location: "Mumbai, MH", city: "Mumbai", type: "Metro", rating: 5, price: "₹24,000", image: "https://images.unsplash.com/photo-1570160228303-3e74283830cf?q=80&w=2000", amenities: ["Gateway View", "Iconic Landmark"], safety_score: 5.0, crowd_level: "High", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Sir H.N. Reliance", police: "100", ambulance: "102" } },
        { id: 41, name: "The Oberoi New Delhi", location: "Delhi", city: "Delhi", type: "Metro", rating: 5, price: "₹21,000", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000", amenities: ["Central Location", "Modern Luxury"], safety_score: 4.9, crowd_level: "High", eco_score: 3, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Max Saket", police: "100", ambulance: "102" } },
        { id: 38, name: "The Oberoi Amarvilas", location: "Agra, UP", city: "Agra", type: "Heritage", rating: 5, price: "₹75,000", image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2000", amenities: ["Taj Mahal View", "Royal Decor"], safety_score: 5.0, crowd_level: "High", eco_score: 4, accessibility: { wheelchair: true, elderly: true }, emergency: { hospital: "Jaypee Hospital", police: "100", ambulance: "102" } }
    ];

    const places = useMemo(() => {
        const uniqueCities = [...new Set(hotels.map(h => h.city))];
        return uniqueCities.map(city => {
            const cityHotels = hotels.filter(h => h.city === city);
            return {
                name: city,
                count: cityHotels.length,
                image: cityHotels[0].image // Just take first hotel's image as place cover
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

    const confirmBooking = async () => {
        setIsProcessing(true);
        // Simulate API call for hotel booking
        setTimeout(() => {
            setIsProcessing(false);
            setIsConfirmed(true);
            setTimeout(() => {
                setBookingDetails(null);
                setIsConfirmed(false);
            }, 3000);
        }, 1500);
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
                                                <p className="price">{bookingDetails.price}<span> / night</span></p>
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
                                                <span>{bookingDetails.price}</span>
                                            </div>
                                            <div className="summary-row total">
                                                <span>Grand Total</span>
                                                <span>
                                                    ₹{(parseInt(bookingDetails.price.replace(/[^\d]/g, '')) * bookingForm.guests).toLocaleString()}
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
                                        {isProcessing ? 'Processing...' : 'Confirm Booking'}
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
        </div>
    );
};

export default Hotels;
