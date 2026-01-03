import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/bookings', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await res.json();
                if (res.ok) {
                    setBookings(data);
                }
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) return <div className="loading-bookings">Fetching your adventure history...</div>;

    return (
        <div className="my-bookings-page">
            <div className="container bookings-container">
                <div className="bookings-header">
                    <h1>My Trips</h1>
                    <Link to="/packages" className="btn btn-primary">Book New Trip</Link>
                </div>

                {bookings.length > 0 ? (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking.booking_id} className="booking-card-horizontal">
                                <div className="booking-thumb">
                                    <img src={booking.image_url} alt={booking.package_name} />
                                </div>
                                <div className="booking-info-detailed">
                                    <div className="info-left">
                                        <div className="status-badge-container">
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <h3>{booking.package_name}</h3>
                                        <div className="destination">
                                            <MapPin size={16} />
                                            <span>{booking.destination}</span>
                                        </div>
                                        <div className="booking-meta-grid">
                                            <div className="meta-item">
                                                <Calendar size={18} />
                                                <span>Travel: {new Date(booking.travel_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Clock size={18} />
                                                <span>Booked: {new Date(booking.booking_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Package size={18} />
                                                <span>ID: #VV-{booking.booking_id}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info-right">
                                        <div className="price-info">
                                            <p style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Total Amount Paid</p>
                                            <div className="booking-price-tag">₹{booking.total_amount}</div>
                                        </div>
                                        <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a0a0a0' }}>
                                            View Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-bookings">
                        <Package size={64} color="rgba(255,255,255,0.1)" />
                        <h2>No bookings yet</h2>
                        <p>It looks like you haven't planned any trips with us yet. Let's change that!</p>
                        <Link to="/packages" className="btn btn-primary">Explore Packages</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyBookings;
