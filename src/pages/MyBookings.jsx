import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar, MapPin, Package, Clock, IndianRupee, Hotel, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './MyBookings.css';

const MyBookings = () => {
    const { user } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [bookingFilter, setBookingFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'info' }); // type: info, success, error, confirm
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    const cancellationReasons = [
        "Change of plans",
        "Found a better price",
        "Medical emergency",
        "Weather concerns",
        "Other"
    ];


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

    const handleViewInvoice = (booking) => {
        setSelectedInvoice(booking);
    };

    const handleCancel = async (id) => {
        setCancelReason('');
        setCustomReason('');
        setModal({
            show: true,
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel this trip? Please select a reason below.',
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
                    message: 'Trip cancelled successfully! You can now request a refund.',
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

    const handleRequestRefund = async (id) => {
        try {
            const res = await fetch(`/api/bookings/${id}/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setModal({
                    show: true,
                    title: 'Refund Requested',
                    message: 'Your refund request has been submitted and is processing.',
                    type: 'success',
                    onConfirm: null
                });
                fetchBookings();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to request refund');
            }
        } catch (err) {
            console.error(err);
            alert('Error requesting refund');
        }
    };


    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-capture-area');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`VistaVoyage_Invoice_${selectedInvoice.id || selectedInvoice.booking_id}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Could not generate PDF. Please try again.");
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (bookingFilter === 'Cancelled') return b.status === 'Cancelled';
        if (b.status === 'Cancelled') return false; // Don't show cancelled in other tabs
        return bookingFilter === 'All' || b.item_type === bookingFilter;
    });

    if (loading) return <div className="loading-bookings">Fetching your adventure history...</div>;

    return (
        <div className="my-bookings-page">
            <div className="container bookings-container">
                <div className="bookings-header">
                    <h1>My Trips</h1>
                    <div className="booking-filters" style={{ display: 'flex', gap: '12px', marginTop: '15px', flexWrap: 'wrap' }}>
                        <button
                            className={`filter-btn ${bookingFilter === 'All' ? 'active' : ''}`}
                            onClick={() => setBookingFilter('All')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: '1px solid ' + (bookingFilter === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.3)'),
                                background: bookingFilter === 'All' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            All
                        </button>
                        <button
                            className={`filter-btn ${bookingFilter === 'Hotel' ? 'active' : ''}`}
                            onClick={() => setBookingFilter('Hotel')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: '1px solid ' + (bookingFilter === 'Hotel' ? 'var(--primary)' : 'rgba(255,255,255,0.3)'),
                                background: bookingFilter === 'Hotel' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            <Hotel size={16} /> Booked Hotels
                        </button>
                        <button
                            className={`filter-btn ${bookingFilter === 'Taxi' ? 'active' : ''}`}
                            onClick={() => setBookingFilter('Taxi')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: '1px solid ' + (bookingFilter === 'Taxi' ? 'var(--primary)' : 'rgba(255,255,255,0.3)'),
                                background: bookingFilter === 'Taxi' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            <Car size={16} /> Booked Taxis
                        </button>
                        <button
                            className={`filter-btn ${bookingFilter === 'Package' ? 'active' : ''}`}
                            onClick={() => setBookingFilter('Package')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: '1px solid ' + (bookingFilter === 'Package' ? 'var(--primary)' : 'rgba(255,255,255,0.3)'),
                                background: bookingFilter === 'Package' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            <Package size={16} /> Packages
                        </button>
                        <button
                            className={`filter-btn ${bookingFilter === 'Cancelled' ? 'active' : ''}`}
                            onClick={() => setBookingFilter('Cancelled')}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '50px',
                                border: '1px solid ' + (bookingFilter === 'Cancelled' ? '#ef4444' : 'rgba(255,255,255,0.3)'),
                                background: bookingFilter === 'Cancelled' ? '#ef4444' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s ease',
                                outline: 'none'
                            }}
                        >
                            Cancelled & Refunds
                        </button>
                    </div>
                </div>

                {bookings.length > 0 ? (
                    <div className="bookings-list">
                        {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
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
                                                <span>
                                                    {booking.adults ? `${booking.adults} Adult${booking.adults > 1 ? 's' : ''}` : `${booking.guests || 1} Guest${(booking.guests || 1) > 1 ? 's' : ''}`}
                                                    {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? 'ren' : ''}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info-right">
                                        <div className="price-info">
                                            <p style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Total Amount Paid</p>
                                            <div className="booking-price-tag">₹{Math.round(booking.total_amount).toLocaleString()}</div>
                                        </div>
                                        <div className="action-buttons" style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => handleViewInvoice(booking)}
                                                style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#a0a0a0' }}
                                            >
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

                                            {booking.status === 'Cancelled' && (
                                                !booking.refund_status ? (
                                                    <button
                                                        className="btn"
                                                        onClick={() => handleRequestRefund(booking.id || booking.booking_id)}
                                                        style={{ background: '#3b82f6', color: 'white', border: 'none' }}
                                                    >
                                                        Request Refund
                                                    </button>
                                                ) : (
                                                    <span style={{
                                                        padding: '8px 16px',
                                                        borderRadius: '6px',
                                                        background: booking.refund_status === 'Processing' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                                                        color: booking.refund_status === 'Processing' ? '#fbbf24' : '#4ade80',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        Refund: {booking.refund_status}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="empty-bookings" style={{ padding: '50px 0' }}>
                                <h3>No {bookingFilter !== 'All' ? bookingFilter.toLowerCase() : ''} bookings found.</h3>
                            </div>
                        )}
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

            {/* Invoice Modal */}
            {selectedInvoice && (
                <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
                    <div
                        id="invoice-capture-area"
                        className="invoice-modal"
                        style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '16px',
                            maxWidth: '600px',
                            width: '90%',
                            position: 'relative',
                            color: '#1e293b'
                        }}
                    >
                        <button
                            onClick={() => setSelectedInvoice(null)}
                            data-html2canvas-ignore="true"
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}
                        >
                            &times;
                        </button>

                        <div className="invoice-header" style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.8rem' }}>INVOICE</h2>
                                <p style={{ margin: '5px 0 0', color: '#64748b' }}>#{selectedInvoice.id || selectedInvoice.booking_id}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#334155' }}>Vista Voyage</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Travel & Tours</p>
                            </div>
                        </div>

                        <div className="invoice-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                                <div className="invoice-section">
                                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '5px' }}>Billed To</p>
                                    <p style={{ margin: 0, fontWeight: '600', fontSize: '1.1rem' }}>{user?.name || selectedInvoice.fullName || selectedInvoice.customer || selectedInvoice.full_name || selectedInvoice.name || 'VistaVoyage Traveler'}</p>
                                </div>
                                <div className="invoice-section" style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 'bold', marginBottom: '5px' }}>Date Issued</p>
                                    <p style={{ margin: 0, fontWeight: '600' }}>{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ textAlign: 'left', padding: '12px', color: '#64748b', fontSize: '0.9rem' }}>Destination</th>
                                        <th style={{ textAlign: 'center', padding: '12px', color: '#64748b', fontSize: '0.9rem' }}>Type</th>
                                        <th style={{ textAlign: 'right', padding: '12px', color: '#64748b', fontSize: '0.9rem' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: '600' }}>{selectedInvoice.item_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {selectedInvoice.city} •
                                                {selectedInvoice.adults ? `${selectedInvoice.adults} Adult${selectedInvoice.adults > 1 ? 's' : ''}` : `${selectedInvoice.guests || 1} Guest${(selectedInvoice.guests || 1) > 1 ? 's' : ''}`}
                                                {selectedInvoice.children > 0 && `, ${selectedInvoice.children} Child${selectedInvoice.children > 1 ? 'ren' : ''}`}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '15px' }}>
                                            <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{selectedInvoice.item_type}</span>
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '15px', fontWeight: '600' }}>
                                            ₹{Math.round(selectedInvoice.total_amount).toLocaleString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', borderTop: '2px solid #f1f5f9', paddingTop: '20px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 5px', color: '#64748b' }}>Subtotal</p>
                                    <p style={{ margin: '0 0 5px', color: '#64748b' }}>Tax (0%)</p>
                                    <h3 style={{ margin: '10px 0 0', fontSize: '1.5rem', color: '#0f172a' }}>Total: ₹{Math.round(selectedInvoice.total_amount).toLocaleString()}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="invoice-footer" data-html2canvas-ignore="true" style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                onClick={handleDownloadPDF}
                                className="btn btn-primary"
                                style={{ padding: '12px 30px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span>Download PDF</span>
                            </button>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '15px' }}>Thank you for travelling with VistaVoyage!</p>
                        </div>
                    </div>
                </div>
            )}

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
                        {modal.type === 'confirm' && (
                            <div style={{ margin: '15px 0', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>Reason for cancellation</label>
                                <select
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                >
                                    <option value="">Select a reason...</option>
                                    {cancellationReasons.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {modal.type === 'confirm' && cancelReason === 'Other' && (
                            <div style={{ marginBottom: '15px' }}>
                                <textarea
                                    className="form-control"
                                    placeholder="Please specify your reason..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }}
                                />
                            </div>
                        )}
                        <div className="modal-actions">
                            {modal.type === 'confirm' ? (
                                <>
                                    <button
                                        className="btn btn-primary"
                                        onClick={modal.onConfirm}
                                        disabled={!cancelReason || (cancelReason === 'Other' && !customReason.trim())}
                                        style={{ opacity: (!cancelReason || (cancelReason === 'Other' && !customReason.trim())) ? 0.6 : 1, cursor: (!cancelReason || (cancelReason === 'Other' && !customReason.trim())) ? 'not-allowed' : 'pointer' }}
                                    >
                                        Yes, Cancel It
                                    </button>
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
