import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Search, ArrowLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        { id: 1, name: "Blanket Hotel and Spa", location: "Attukad Falls, Munnar", city: "Munnar", type: "Mountain", rating: 5, price: "₹10,500", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000", amenities: ["Infinity Pool", "Waterfall View"] },
        { id: 2, name: "Fragrant Nature Munnar", location: "Pothamedu, Munnar", city: "Munnar", type: "Mountain", rating: 4.9, price: "₹9,800", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000", amenities: ["Fine Dining", "Yoga Deck"] },
        { id: 3, name: "The Panoramic Getaway", location: "Chithirapuram, Munnar", city: "Munnar", type: "Mountain", rating: 4.8, price: "₹12,400", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000", amenities: ["Rooftop Pool", "Helipad"] },
        { id: 4, name: "SpiceTree Munnar", location: "Chinnakanal, Munnar", city: "Munnar", type: "Mountain", rating: 4.7, price: "₹15,000", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2000", amenities: ["Private Jacuzzi", "Tea Plantation"] },

        // --- GOA ---
        { id: 13, name: "ITC Grand Goa Resort", location: "Arossim Beach, Goa", city: "Goa", type: "Beach", rating: 5, price: "₹18,500", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=2000", amenities: ["Private Beach", "Village Style"] },
        { id: 14, name: "Taj Exotica Resort & Spa", location: "Benaulim, Goa", city: "Goa", type: "Beach", rating: 4.9, price: "₹16,200", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000", amenities: ["Golf Course", "Jiva Spa"] },
        { id: 50, name: "W Goa", location: "Vagator Beach, Goa", city: "Goa", type: "Beach", rating: 4.8, price: "₹22,000", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000", amenities: ["Private Cabanas", "Sunset Bar"] },

        // --- UDAIPUR ---
        { id: 15, name: "The Leela Palace", location: "Lake Pichola, Udaipur", city: "Udaipur", type: "Heritage", rating: 5, price: "₹28,000", image: "https://images.unsplash.com/photo-1549463387-92c21a1d1235?q=80&w=2000", amenities: ["Lake View", "Royal Decor"] },
        { id: 16, name: "The Ananta Udaipur", location: "Kodiyat, Udaipur", city: "Udaipur", type: "Heritage", rating: 4.7, price: "₹9,500", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000", amenities: ["Mountain View", "Spa"] },
        { id: 51, name: "Taj Lake Palace", location: "Lake Pichola, Udaipur", city: "Udaipur", type: "Heritage", rating: 5, price: "₹45,000", image: "https://images.unsplash.com/photo-1590611380053-da643716d82b?q=80&w=2000", amenities: ["Floating Palace", "Boat Arrival"] },

        // --- MANALI ---
        { id: 17, name: "The Himalayan", location: "Hadimba Rd, Manali", city: "Manali", type: "Mountain", rating: 4.8, price: "₹14,200", image: "https://images.unsplash.com/photo-1544085311-11a028465b03?q=80&w=2000", amenities: ["Castle Stay", "Mountain Pool"] },
        { id: 52, name: "Solang Valley Resort", location: "Solang, Manali", city: "Manali", type: "Mountain", rating: 4.6, price: "₹11,500", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2000", amenities: ["River Side", "Adventure Hub"] },
        { id: 53, name: "Span Resort & Spa", location: "Kullu-Manali Hwy", city: "Manali", type: "Mountain", rating: 4.7, price: "₹16,000", image: "https://images.unsplash.com/photo-1551882547-ff43c61fe9b7?q=80&w=2000", amenities: ["Luxury Cottages", "Trout Fishing"] },

        // --- LEH LADAKH ---
        { id: 18, name: "The Grand Dragon Ladakh", location: "Old Rd, Leh", city: "Leh", type: "Mountain", rating: 4.9, price: "₹10,500", image: "https://images.unsplash.com/photo-1594220551065-9f9fa9bd36d9?q=80&w=2000", amenities: ["Eco-Friendly", "Kashmiri Cuisine"] },
        { id: 19, name: "Dolkhar Resort Leh", location: "Tukcha, Leh", city: "Leh", type: "Mountain", rating: 5, price: "₹12,800", image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=2000", amenities: ["Sauna", "Conscious Travel"] },
        { id: 54, name: "The Zen Ladakh", location: "Sheynam, Leh", city: "Leh", type: "Mountain", rating: 4.8, price: "₹9,200", image: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2000", amenities: ["Heated Pool", "Monastery View"] },

        // --- SRINAGAR ---
        { id: 26, name: "The Khyber Himalayan Resort", location: "Gulmarg Rd, Srinagar", city: "Srinagar", type: "Mountain", rating: 5, price: "₹25,800", image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2000", amenities: ["Mountain Views", "Ski Access"] },
        { id: 55, name: "The Lalit Grand Palace", location: "Gupkar Rd, Srinagar", city: "Srinagar", type: "Heritage", rating: 4.9, price: "₹18,500", image: "https://images.unsplash.com/photo-1512918766671-ad650b9b732d?q=80&w=2000", amenities: ["Dal Lake View", "Heritage Garden"] },
        { id: 56, name: "Vivanta Dal View", location: "Kralsangri, Srinagar", city: "Srinagar", type: "Mountain", rating: 4.8, price: "₹21,000", image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?q=80&w=2000", amenities: ["Hilltop View", "Modern Luxury"] },

        // --- COORG ---
        { id: 29, name: "The Tamara Coorg", location: "Yevakapadi, Coorg", city: "Coorg", type: "Mountain", rating: 4.9, price: "₹19,800", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2000", amenities: ["Plantation Walk", "Infinite Pool"] },
        { id: 30, name: "Evolve Back Coorg", location: "Siddapur, Coorg", city: "Coorg", type: "Mountain", rating: 5, price: "₹34,000", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2000", amenities: ["Private Pool Villa", "Cultural Show"] },

        // --- WAYANAD ---
        { id: 31, name: "Vythiri Resort", location: "Lakkidi, Wayanad", city: "Wayanad", type: "Mountain", rating: 4.7, price: "₹15,500", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000", amenities: ["Tree House", "Suspension Bridge"] },
        { id: 57, name: "Banasura Hill Resort", location: "Vellamunda, Wayanad", city: "Wayanad", type: "Mountain", rating: 4.6, price: "₹9,800", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=2000", amenities: ["Earth Resort", "Nature Trails"] },

        // --- JAIPUR ---
        { id: 21, name: "Rambagh Palace", location: "Bhawani Singh Rd, Jaipur", city: "Jaipur", type: "Heritage", rating: 5, price: "₹72,000", image: "https://images.unsplash.com/photo-1590611380053-da643716d82b?q=80&w=2000", amenities: ["Royal Gardens", "Heritage Decor"] },
        { id: 22, name: "The Oberoi Rajvilas", location: "Goner Rd, Jaipur", city: "Jaipur", type: "Heritage", rating: 5, price: "₹58,000", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000", amenities: ["Private Pools", "Alfresco Dining"] },
        { id: 58, name: "Fairmont Jaipur", location: "Kukas, Jaipur", city: "Jaipur", type: "Heritage", rating: 4.9, price: "₹21,500", image: "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=2000", amenities: ["Luxury Suites", "Grand Architecture"] },

        // --- VARANASI ---
        { id: 23, name: "BrijRama Palace", location: "Darbhanga Ghat, Varanasi", city: "Varanasi", type: "Heritage", rating: 4.9, price: "₹24,500", image: "https://images.unsplash.com/photo-1561224737-268153600bef?q=80&w=2000", amenities: ["Ganges River View", "Historic Palace"] },
        { id: 59, name: "Taj Nadesar Palace", location: "Nadesar, Varanasi", city: "Varanasi", type: "Heritage", rating: 5, price: "₹35,000", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2000", amenities: ["Royal Suites", "Guided Tours"] },

        // --- RISHIKESH ---
        { id: 24, name: "Lemon Tree Premier", location: "Tapovan, Rishikesh", city: "Rishikesh", type: "Mountain", rating: 4.7, price: "₹14,800", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000", amenities: ["Personal Ghat", "River Access"] },
        { id: 60, name: "Taj Rishikesh Resort", location: "Singthali, Rishikesh", city: "Rishikesh", type: "Mountain", rating: 5, price: "₹38,000", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000", amenities: ["Private Beach", "Himalayan Spa"] },

        // --- ANDAMAN ---
        { id: 25, name: "Taj Exotica Resort & Spa", location: "Radhanagar Beach, Andaman", city: "Andaman", type: "Beach", rating: 5, price: "₹32,000", image: "https://images.unsplash.com/photo-1551882547-ff43c61fe9b7?q=80&w=2000", amenities: ["Olympic Pool", "Eco-Friendly"] },
        { id: 61, name: "Munjoh Ocean Resort", location: "Havelock Island, Andaman", city: "Andaman", type: "Beach", rating: 4.7, price: "₹12,500", image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2000", amenities: ["Private Patios", "Snorkeling Hub"] },

        // --- MUMBAI ---
        { id: 40, name: "The Taj Mahal Palace", location: "Mumbai, MH", city: "Mumbai", type: "Metro", rating: 5, price: "₹24,000", image: "https://images.unsplash.com/photo-1570160228303-3e74283830cf?q=80&w=2000", amenities: ["Gateway View", "Iconic Landmark"] },
        { id: 62, name: "St. Regis Mumbai", location: "Lower Parel, Mumbai", city: "Mumbai", type: "Metro", rating: 4.9, price: "₹18,500", image: "https://images.unsplash.com/photo-1512918766671-ad650b9b732d?q=80&w=2000", amenities: ["City Skyline View", "Butler Service"] },

        // --- DELHI ---
        { id: 41, name: "The Oberoi New Delhi", location: "Delhi", city: "Delhi", type: "Metro", rating: 5, price: "₹21,000", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2000", amenities: ["Central Location", "Modern Luxury"] },
        { id: 46, name: "Taj Mahal Hotel", location: "Delhi", city: "Delhi", type: "Metro", rating: 4.9, price: "₹22,500", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2000", amenities: ["Signature Suites", "Royal Dining"] },
        { id: 63, name: "JW Marriott Aerocity", location: "Aerocity, Delhi", city: "Delhi", type: "Metro", rating: 4.8, price: "₹15,500", image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2000", amenities: ["Proximity to Airport", "Luxury Spa"] },

        // --- BENGALURU ---
        { id: 42, name: "ITC Gardenia", location: "Bengaluru, KA", city: "Bengaluru", type: "Metro", rating: 4.9, price: "₹18,000", image: "https://images.unsplash.com/photo-1512918766671-ad650b9b732d?q=80&w=2000", amenities: ["Vertical Gardens", "Eco-Luxury"] },
        { id: 64, name: "The Ritz-Carlton", location: "Residency Rd, Bengaluru", city: "Bengaluru", type: "Metro", rating: 5, price: "₹22,000", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000", amenities: ["Modern Interiors", "Signature Dining"] },

        // --- AGRA ---
        { id: 38, name: "The Oberoi Amarvilas", location: "Agra, UP", city: "Agra", type: "Heritage", rating: 5, price: "₹75,000", image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?q=80&w=2000", amenities: ["Taj Mahal View", "Royal Decor"] },
        { id: 65, name: "ITC Mughal", location: "Fatehabad Rd, Agra", city: "Agra", type: "Heritage", rating: 4.8, price: "₹14,500", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000", amenities: ["Mughal Gardens", "Award-winning Spa"] },

        // --- SHIMLA ---
        { id: 34, name: "Wildflower Hall", location: "Shimla, HP", city: "Shimla", type: "Mountain", rating: 5, price: "₹28,500", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000", amenities: ["Ayurvedic Spa", "Heated Pool"] },
        { id: 66, name: "The Oberoi Cecil", location: "Chaura Maidan, Shimla", city: "Shimla", type: "Mountain", rating: 4.9, price: "₹16,500", image: "https://images.unsplash.com/photo-1569724108849-0d196f01a357?q=80&w=2000", amenities: ["Heritage Property", "Central Location"] },

        // --- JODHPUR ---
        { id: 37, name: "Umaid Bhawan Palace", location: "Jodhpur, RJ", city: "Jodhpur", type: "Heritage", rating: 5, price: "₹85,000", image: "https://images.unsplash.com/photo-1598890777032-bde835ba27c2?q=80&w=2000", amenities: ["World Heritage", "Royal Luxury"] },
        { id: 67, name: "Taj Hari Mahal", location: "Residency Rd, Jodhpur", city: "Jodhpur", type: "Heritage", rating: 4.8, price: "₹13,800", image: "https://images.unsplash.com/photo-1512918766671-ad650b9b732d?q=80&w=2000", amenities: ["Marwar Decor", "Pool Relaxation"] },

        // --- ALLEPPEY ---
        { id: 20, name: "Marari Beach Resort", location: "Marari, Alleppey", city: "Alleppey", type: "Beach", rating: 4.8, price: "₹22,000", image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2000", amenities: ["Eco-friendly", "Beachfront View"] },
        { id: 68, name: "Lake Canopy", location: "Punnamada, Alleppey", city: "Alleppey", type: "Beach", rating: 4.6, price: "₹9,500", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000", amenities: ["Modern Amenities", "Backwater Proximity"] }
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

                    <div className="hotels-search-bar glass-card">
                        <Search size={22} />
                        <input
                            type="text"
                            placeholder={selectedPlace ? `Search hotels in ${selectedPlace}...` : "Search destinations (e.g. Goa, Munnar)..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

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
                                    </div>
                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={confirmBooking}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : 'Confirm Booking'}
                                    </button>
                                </>
                            ) : (
                                <div className="confirmation-screen">
                                    <div className="success-icon">✓</div>
                                    <h2>Booking Confirmed!</h2>
                                    <p>Your stay at <strong>{bookingDetails.name}</strong> has been reserved.</p>
                                    <p className="subtext">Check your email for the confirmation voucher.</p>
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
