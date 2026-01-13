import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Shield, MapPin, Search, ArrowLeft, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import PaymentModal from '../components/PaymentModal';
import FavoriteButton from '../components/FavoriteButton';
import ReviewSection from '../components/ReviewSection';
import './Taxis.css';

const Taxis = () => {
    const navigate = useNavigate();

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookingDetails, setBookingDetails] = useState(null);
    const [taxis, setTaxis] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        pickUpDate: '',
        pickUpTime: '10:00',
        fullName: '',
        email: '',
        phone: '',
        pickUpAddress: '',
        dropAddress: ''
    });

    const [filterOption, setFilterOption] = useState('all');

    useEffect(() => {
        fetchTaxis();
    }, []);

    const fetchTaxis = async () => {
        try {
            const res = await axios.get('/api/taxis');
            setTaxis(res.data);
        } catch (err) {
            console.error('Error fetching taxis:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const cities = useMemo(() => {
        return [...new Set(taxis.map(t => t.city))];
    }, [taxis]);

    const carImages = [
        "https://images.unsplash.com/photo-1550355403-51975078382d", // Sedan black
        "https://images.unsplash.com/photo-1549194388-f61be84a6e9e", // Sedan white
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d", // Luxury
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d", // Blue car
        "https://images.unsplash.com/photo-1563720223185-11003d516935", // Red car
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70", // Porsche
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7", // Black sedan
        "https://images.unsplash.com/photo-1583121274602-3e2820d69e6e", // Ferrari
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf043", // Yellow car
        "https://images.unsplash.com/photo-1542362567-b0546e10f699", // Range Rover
        "https://images.unsplash.com/photo-1565043589221-1a6f99347523", // Electric
        "https://images.unsplash.com/photo-1594502184342-2e12f877aa73", // SUV
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d", // Offroad
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c", // Supercar
        "https://images.unsplash.com/photo-1555215695-3004980ad54e", // BMW
        "https://images.unsplash.com/photo-1562623348-735999863cf1", // Audi
        "https://images.unsplash.com/photo-1549490349-8643362247b5", // Mercedes
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e", // Modern
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb", // Concept
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2"  // Jaguar
    ];

    const cityImages = {
        "Munnar": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a",
        "Goa": "https://images.unsplash.com/photo-1549194388-f61be84a6e9e",
        "Udaipur": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d",
        "Manali": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d",
        "Leh Ladakh": "https://images.unsplash.com/photo-1563720223185-11003d516935",
        "Srinagar": "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
        "Coorg": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7",
        "Wayanad": "https://images.unsplash.com/photo-1536700503339-1e4b06520771",
        "Jaipur": "https://images.unsplash.com/photo-1557223562-6c77ef1621de",
        "Varanasi": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
        "Rishikesh": "https://images.unsplash.com/photo-1580273916550-e323be2ae537",
        "Andaman": "https://images.unsplash.com/photo-1594502184342-2e12f877aa73",
        "Mumbai": "https://images.unsplash.com/photo-1553440569-bcc63803a83d",
        "Delhi": "https://images.unsplash.com/photo-1511919884226-fd3cad34687c",
        "Bengaluru": "https://images.unsplash.com/photo-1555215695-3004980ad54e",
        "Agra": "https://images.unsplash.com/photo-1469285994282-454ceb49e63c",
        "Shimla": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957",
        "Jodhpur": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e",
        "Alleppey": "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb"
    };

    const places = useMemo(() => {
        return cities.map(city => ({
            name: city,
            count: taxis.filter(t => t.city === city).length,
            image: cityImages[city] ? `${cityImages[city]}?auto=format&fit=crop&w=1000&q=80&v=1.2` : `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1000&q=80&v=1.2`
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [cities, taxis]);


    const filteredPlaces = places.filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const filteredTaxis = useMemo(() => {
        let result = taxis.filter(taxi =>
            taxi.city === selectedPlace &&
            (taxi.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filterOption === 'low-price') {
            result.sort((a, b) => a.price_per_km - b.price_per_km);
        } else if (filterOption === 'electric') {
            result = result.filter(t => t.type.toLowerCase().includes('electric'));
        } else if (filterOption === 'top-rated') {
            result = result.filter(t => t.rating >= 4.8);
        }

        return result;
    }, [selectedPlace, searchTerm, taxis, filterOption]);

    const handleBookTaxi = (taxi) => {
        setBookingDetails(taxi);
        setBookingForm({
            pickUpDate: new Date().toISOString().split('T')[0],
            pickUpTime: '10:00',
            fullName: '',
            email: '',
            phone: '',
            pickUpAddress: '',
            dropAddress: ''
        });
        setIsConfirmed(false);
    };

    const confirmBooking = () => {
        setIsPaymentModalOpen(true);
    };

    const handleFinalBooking = async () => {
        setIsPaymentModalOpen(false);
        setIsProcessing(true);

        const token = localStorage.getItem('token');
        const amount = bookingDetails.rawPrice * 50; // Simulated 50km trip

        try {
            await axios.post('/api/bookings', {
                itemId: bookingDetails.id,
                itemType: 'Taxi',
                travelDate: bookingForm.pickUpDate,
                totalAmount: amount,
                guests: 1, // Assuming 1 guest for taxi booking, can be made dynamic
                city: selectedPlace,
                pickUpTime: bookingForm.pickUpTime,
                fullName: bookingForm.fullName,
                email: bookingForm.email,
                phone: bookingForm.phone,
                pickUpAddress: bookingForm.pickUpAddress,
                dropAddress: bookingForm.dropAddress
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
            // Optionally show an error message to the user
        }
    };

    return (
        <div className="taxis-page">
            <header className="taxis-hero">
                <div className="container">
                    <h1>City <span>Transfers</span></h1>
                    <p>{selectedPlace ? `Professional taxi services in ${selectedPlace}` : 'Find reliable and safe taxi services across all major Indian cities.'}</p>
                    <div style={{ color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontSize: '0.9rem' }}>
                        {taxis.length} available across {cities.length} cities
                    </div>

                    <div className="taxis-search-bar glass-card">
                        <Search size={22} />
                        <input
                            type="text"
                            placeholder={selectedPlace ? `Search vehicles in ${selectedPlace}...` : "Search cities (e.g. Goa, Delhi)..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {selectedPlace && (
                        <div className="taxi-filters">
                            <button className={filterOption === 'all' ? 'active' : ''} onClick={() => setFilterOption('all')}>All</button>
                            <button className={filterOption === 'electric' ? 'active' : ''} onClick={() => setFilterOption('electric')}>Electric</button>
                            <button className={filterOption === 'top-rated' ? 'active' : ''} onClick={() => setFilterOption('top-rated')}>Top Rated</button>
                            <button className={filterOption === 'low-price' ? 'active' : ''} onClick={() => setFilterOption('low-price')}>Price: Low to High</button>
                        </div>
                    )}

                    {selectedPlace && (
                        <button className="btn-back-places" onClick={() => { setSelectedPlace(null); setSearchTerm(''); setFilterOption('all'); }}>
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
                            className="taxis-places-grid"
                        >
                            {filteredPlaces.map((place, idx) => (
                                <motion.div
                                    key={place.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="place-card glass-card"
                                    onClick={() => setSelectedPlace(place.name)}
                                >
                                    <div className="place-image">
                                        <img
                                            src={place.image}
                                            alt={place.name}
                                            onError={(e) => {
                                                if (!e.target.src.includes('picsum.photos')) {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://picsum.photos/seed/${place.name}-taxi/1000/600`;
                                                }
                                            }}
                                        />
                                        <div className="place-overlay">
                                            <h3>{place.name}</h3>
                                            <span><Car size={16} /> 5 Vehicles Available</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="taxis-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="taxis-grid"
                        >
                            {filteredTaxis.map(taxi => (
                                <div key={taxi.id} className="taxi-card glass-card">
                                    <div className="taxi-image">
                                        <img
                                            src={taxi.image}
                                            alt={taxi.type}
                                            onError={(e) => {
                                                if (!e.target.src.includes('picsum.photos')) {
                                                    e.target.onerror = null;
                                                    e.target.src = `https://picsum.photos/seed/${taxi.id}-taxi/1000/600`;
                                                }
                                            }}
                                        />
                                        <div className="favorite-action">
                                            <FavoriteButton itemId={taxi.id} itemType="Taxi" />
                                        </div>
                                    </div>
                                    <div className="taxi-details">
                                        <div className="taxi-header">
                                            <div className="taxi-title-row">
                                                <h3>{taxi.type}</h3>
                                                <div className="taxi-rating">
                                                    <Star size={14} fill="currentColor" />
                                                    <span>{taxi.rating}</span>
                                                </div>
                                            </div>
                                            <div className="taxi-rate">₹{taxi.price_per_km}/km</div>
                                        </div>
                                        <div className="taxi-capacity">
                                            <Users size={16} />
                                            <span>{taxi.capacity}</span>
                                        </div>
                                        <div className="taxi-features">
                                            {taxi.features.map(f => (
                                                <div key={f} className="feature-item">
                                                    <Shield size={14} />
                                                    <span>{f}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className="btn btn-primary w-full" onClick={() => handleBookTaxi(taxi)}>
                                            Book This Ride
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="safety-info-card">
                <Shield size={32} color="var(--primary)" />
                <div className="safety-text">
                    <h3>VistaVoyage Safety Standard</h3>
                    <p>All vehicles in {selectedPlace || 'our network'} are sanitized daily, and drivers are fully vaccinated with verified background checks.</p>
                </div>
            </div>

            {/* Booking Modal */}
            <AnimatePresence>
                {bookingDetails && (
                    <div className="modal-overlay">
                        <motion.div
                            className="booking-modal glass-card"
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                        >
                            {!isConfirmed ? (
                                <>
                                    <div className="modal-header">
                                        <h2>Book {bookingDetails.type} in {bookingDetails.city}</h2>
                                        <button className="close-btn" onClick={() => setBookingDetails(null)}>×</button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="booking-inputs">
                                            <div className="input-group">
                                                <label>Passenger Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Enter full name"
                                                    value={bookingForm.fullName}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <div className="input-group">
                                                    <label>Phone</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        placeholder="Your phone"
                                                        value={bookingForm.phone}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="Your email"
                                                        value={bookingForm.email}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="input-group">
                                                <label>Pickup Location</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Hotel name or street address"
                                                    value={bookingForm.pickUpAddress}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, pickUpAddress: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Destination (Drop Location)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Where are you going?"
                                                    value={bookingForm.dropAddress}
                                                    onChange={(e) => setBookingForm({ ...bookingForm, dropAddress: e.target.value })}
                                                />
                                            </div>
                                            <div className="input-grid">
                                                <div className="input-group">
                                                    <label>Date</label>
                                                    <input
                                                        type="date"
                                                        className="form-control"
                                                        value={bookingForm.pickUpDate}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, pickUpDate: e.target.value })}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Pickup Time</label>
                                                    <input
                                                        type="time"
                                                        className="form-control"
                                                        value={bookingForm.pickUpTime}
                                                        onChange={(e) => setBookingForm({ ...bookingForm, pickUpTime: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={confirmBooking}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Confirming Ride...' : 'Confirm Pickup'}
                                    </button>

                                    <div className="modal-divider"></div>
                                    <ReviewSection itemId={bookingDetails.id} itemType="Taxi" />
                                </>
                            ) : (
                                <div className="confirmation-screen">
                                    <div className="success-icon">✓</div>
                                    <h2>Ride Confirmed!</h2>
                                    <p>Your {bookingDetails.type} in {bookingDetails.city} is scheduled.</p>
                                    <p className="subtext">The driver details will be sent 30 mins before pickup.</p>
                                    <button className="btn btn-outline" onClick={() => setBookingDetails(null)}>Close</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onConfirm={handleFinalBooking}
                amount={bookingDetails ? bookingDetails.rawPrice * 50 : 0} // Simulated 50km booking
            />
        </div>
    );
};

export default Taxis;
