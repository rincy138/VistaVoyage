import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Clock, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MyBookings.css';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'info' }); // type: info, success, error, confirm


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
            } else {
                console.error("Failed to fetch bookings:", data.message || res.statusText);
                setBookings([]); // Clear bookings on error
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setBookings([]); // Clear bookings on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        setModal({
            show: true,
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel this trip? This action cannot be undone.',
            type: 'confirm',
            onConfirm: () => performCancellation(id)
        });
    };

    const performCancellation = async (id) => {
        setModal(prev => ({ ...prev, show: false })); // Hide confirm modal

        try {
            const res = await fetch(`/api/bookings/${id}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                setModal({
                    show: true,
                    title: 'Cancelled!',
                    message: 'Trip cancelled successfully!',
                    type: 'success',
                    onConfirm: null
                });
                fetchBookings(); // Refresh list
            } else {
                const data = await res.json();
                setModal({
                    show: true,
                    title: 'Error',
                    message: data.message || "Cancellation failed. Please try again.",
                    type: 'error',
                    onConfirm: null
                });
            }
        } catch (err) {
            console.error("Error cancelling booking:", err);
            setModal({
                show: true,
                title: 'Network Error',
                message: "Error cancelling booking. Please check your network connection.",
                type: 'error',
                onConfirm: null
            });
        }
    };


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
                            <div key={booking.id || booking.booking_id} className="booking-card-horizontal">
                                <div className="booking-thumb">
                                    <img
                                        src={booking.image}
                                        alt={booking.item_name}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000';
                                        }}
                                    />
                                </div>
                                <div className="booking-info-detailed">
                                    <div className="info-left">
                                        <div className="status-badge-container">
                                            <span className={`status-badge ${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                            <span className="type-badge-mini">{booking.item_type}</span>
                                        </div>
                                        <h3>{booking.item_name}</h3>
                                        <div className="destination">
                                            <MapPin size={16} />
                                            <span>{booking.city || 'India'}</span>
                                        </div>
                                        <div className="booking-meta-grid">
                                            <div className="meta-item">
                                                <Calendar size={18} />
                                                <span>Date: {new Date(booking.travel_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <IndianRupee size={18} />
                                                <span>Amount: ₹{Math.round(booking.total_amount).toLocaleString()}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Package size={18} />
                                                <span>ID: #VV-{booking.id || booking.booking_id}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Clock size={18} />
                                                <span>Guests: {booking.guests || 1}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info-right">
                                        <div className="price-info">
                                            <p style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Total Amount Paid</p>
                                            <div className="booking-price-tag">₹{Math.round(booking.total_amount).toLocaleString()}</div>
                                        </div>
                                        <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                            <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a0a0a0' }}>
                                                View Invoice
                                            </button>
                                            {(booking.status === 'Booked' || booking.status === 'Confirmed') && (
                                                <button
                                                    className="btn btn-secondary cancel-btn"
                                                    onClick={() => handleCancel(booking.id || booking.booking_id)}
                                                    style={{ background: 'rgba(255, 71, 71, 0.1)', color: '#ff4747', border: '1px solid rgba(255, 71, 71, 0.2)' }}
                                                >
                                                    Cancel Trip
                                                </button>
                                            )}
                                        </div>
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

            {/* Custom Modal */}
            {modal.show && (
                <div className="custom-modal-overlay">
                    <div className={`custom-modal ${modal.type}`}>
                        <div className="modal-icon">
                            {modal.type === 'success' && <div className="icon-success">✓</div>}
                            {modal.type === 'error' && <div className="icon-error">✕</div>}
                            {modal.type === 'confirm' && <div className="icon-confirm">?</div>}
                        </div>
                        <h2>{modal.title}</h2>
                        <p>{modal.message}</p>
                        <div className="modal-actions">
                            {modal.type === 'confirm' ? (
                                <>
                                    <button className="btn btn-primary" onClick={modal.onConfirm}>Yes, Cancel It</button>
                                    <button className="btn btn-outline" onClick={() => setModal({ ...modal, show: false })}>Go Back</button>
                                </>
                            ) : (
                                <button className="btn btn-primary" onClick={() => setModal({ ...modal, show: false })}>OK</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default MyBookings;
