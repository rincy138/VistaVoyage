import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Package, Calendar, Users, Briefcase, Plus, Edit, Trash2, CheckCircle, XCircle, Map, DollarSign, MessageSquare } from 'lucide-react';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('packages');
    const [packages, setPackages] = useState([]);

    // Package Form State
    const [isEditing, setIsEditing] = useState(false);
    const [currentPkgId, setCurrentPkgId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        price: '',
        duration: '',
        description: '',
        image_url: '',
        available_slots: 10,
        itinerary: '' // Added itinerary field
    });

    // MOCKED Bookings Data for demo (since backend doesn't support agent Booking view yet)
    const [bookings, setBookings] = useState([
        { id: 101, customer: "Rahul Sharma", pkg: "Kerala Backwaters", date: "2025-02-15", guests: 2, status: "Pending", amount: "15,000" },
        { id: 102, customer: "Anita Desai", pkg: "Manali Adventure", date: "2025-03-10", guests: 4, status: "Confirmed", amount: "24,000" },
        { id: 103, customer: "John Doe", pkg: "Goa Beach Party", date: "2025-01-20", guests: 1, status: "Cancelled", amount: "8,000" },
    ]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (activeTab === 'packages') {
            fetchPackages();
        }
    }, [activeTab]);

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            // Client-side filter for now
            const myPackages = data.filter(pkg => pkg.agent_id === user.id);
            setPackages(myPackages);
        } catch (err) {
            console.error("Failed to fetch packages", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (pkg) => {
        setIsEditing(true);
        setCurrentPkgId(pkg.id);
        setFormData({
            title: pkg.title,
            destination: pkg.destination,
            price: pkg.price,
            duration: pkg.duration || '',
            description: pkg.description || '',
            image_url: pkg.image_url || '',
            available_slots: pkg.available_slots || 10,
            itinerary: pkg.itinerary || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setIsEditing(false);
        setCurrentPkgId(null);
        setFormData({ title: '', destination: '', price: '', duration: '', description: '', image_url: '', available_slots: 10, itinerary: '' });
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const url = isEditing ? `/api/packages/${currentPkgId}` : '/api/packages';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Operation failed');

            setMessage(isEditing ? 'Package updated successfully!' : 'Package created successfully!');
            handleReset();
            fetchPackages();
        } catch (err) {
            setMessage('Error saving package');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this package?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/packages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setPackages(packages.filter(p => p.id !== id));
        } catch (err) { console.error(err); }
    };

    // Booking Actions (Mocked)
    const handleBookingAction = (id, action) => {
        setBookings(prev => prev.map(b => {
            if (b.id === id) return { ...b, status: action === 'accept' ? 'Confirmed' : 'Rejected' };
            return b;
        }));
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Agent Dashboard</h1>
                    <p>Welcome back, {user?.name}</p>
                </div>
                <div className="agent-badge">
                    <Briefcase size={20} /> Verified Agent
                </div>
            </div>

            {/* TABS Navigation */}
            <div className="dashboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'packages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('packages')}
                >
                    <Package size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Manage Packages
                </button>
                <button
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    <Users size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Bookings & Requests
                </button>
                <button
                    className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tools')}
                >
                    <Map size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Itinerary Tools
                </button>
            </div>

            {/* CONTENT AREA */}
            <div className="dashboard-content">

                {/* --- packages TAB --- */}
                {activeTab === 'packages' && (
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3 className="form-title">{isEditing ? 'Edit Package' : 'Create New Package'}</h3>
                            {message && <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>{message}</div>}
                            <form className="auth-form" onSubmit={handleSubmit}>
                                <div className="form-group-row">
                                    <input type="text" name="title" placeholder="Package Title" className="form-control" value={formData.title} onChange={handleInputChange} required />
                                    <input type="text" name="destination" placeholder="Destination" className="form-control" value={formData.destination} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group-row">
                                    <input type="number" name="price" placeholder="Price (₹)" className="form-control" value={formData.price} onChange={handleInputChange} required />
                                    <input type="number" name="available_slots" placeholder="Slots" className="form-control" value={formData.available_slots} onChange={handleInputChange} />
                                </div>
                                <input type="text" name="duration" placeholder="Duration (e.g. 5 days)" className="form-control" value={formData.duration} onChange={handleInputChange} />

                                <div className="image-upload-area">
                                    <input type="text" name="image_url" placeholder="Paste Image URL here..." className="form-control" value={formData.image_url} onChange={handleInputChange} style={{ marginBottom: 0 }} />
                                    <p style={{ marginTop: '10px', fontSize: '0.8rem' }}>Or drag and drop image to upload (coming soon)</p>
                                </div>

                                <textarea name="description" placeholder="Description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
                                <textarea name="itinerary" placeholder="Define Itinerary (Day 1: ..., Day 2: ...)" className="form-control" rows="4" value={formData.itinerary} onChange={handleInputChange}></textarea>

                                <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                        {loading ? 'Saving...' : (isEditing ? 'Update Package' : 'Create Package')}
                                    </button>
                                    {isEditing && <button type="button" className="btn btn-secondary" onClick={handleReset}>Cancel</button>}
                                </div>
                            </form>
                        </div>

                        <div className="dashboard-card">
                            <h3 className="form-title">Your Active Packages</h3>
                            <div className="search-bar-wrapper">
                                <input type="text" className="search-bar" placeholder="Search your packages..." />
                            </div>
                            {packages.length === 0 ? (
                                <p className="text-muted">No packages created yet.</p>
                            ) : (
                                <div className="package-list">
                                    {packages.map(pkg => (
                                        <div key={pkg.id} className="package-item">
                                            <div className="package-info">
                                                <h4>{pkg.title}</h4>
                                                <p>{pkg.destination} • {pkg.duration}</p>
                                                <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{pkg.price}</p>
                                            </div>
                                            <div className="package-actions">
                                                <button className="btn-icon" onClick={() => handleEdit(pkg)} title="Edit"><Edit size={16} /></button>
                                                <button className="btn-icon" onClick={() => handleDelete(pkg.id)} title="Delete" style={{ color: '#fca5a5' }}><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- BOOKINGS TAB --- */}
                {activeTab === 'bookings' && (
                    <div className="dashboard-card">
                        <div className="toolbar">
                            <input type="text" className="search-bar" placeholder="Search by customer name or ID..." />
                            <select className="search-bar" style={{ width: '200px', flex: 'none' }}>
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Confirmed</option>
                            </select>
                        </div>

                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer</th>
                                    <th>Package</th>
                                    <th>Date</th>
                                    <th>Guests</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>#{booking.id}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333' }}></div>
                                                {booking.customer}
                                            </div>
                                        </td>
                                        <td>{booking.pkg}</td>
                                        <td>{booking.date}</td>
                                        <td>{booking.guests}</td>
                                        <td>₹{booking.amount}</td>
                                        <td>
                                            <span className={`booking-status status-${booking.status.toLowerCase()}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'Pending' && (
                                                <div className="action-btn-group">
                                                    <button className="btn-icon" style={{ color: '#10b981' }} onClick={() => handleBookingAction(booking.id, 'accept')} title="Accept">
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button className="btn-icon" style={{ color: '#ef4444' }} onClick={() => handleBookingAction(booking.id, 'reject')} title="Reject">
                                                        <XCircle size={18} />
                                                    </button>
                                                    <button className="btn-icon" title="Message"><MessageSquare size={18} /></button>
                                                </div>
                                            )}
                                            {booking.status === 'Confirmed' && (
                                                <button className="btn-sm btn-outline">Assign Guide</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TOOLS TAB --- */}
                {activeTab === 'tools' && (
                    <div className="tools-grid">
                        <div className="tool-card">
                            <h4><Map size={20} /> Modify Itinerary</h4>
                            <p>Quickly adjust days, activities, or routes for active bookings.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }}>Open Editor</button>
                        </div>
                        <div className="tool-card">
                            <h4><DollarSign size={20} /> Adjust Budget</h4>
                            <p>Update pricing for custom requests or calculate margins.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }}>Budget Calculator</button>
                        </div>
                        <div className="tool-card">
                            <h4><MessageSquare size={20} /> Personalize Plans</h4>
                            <p>Add special notes, surprise events, or custom requests.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }}>Add Note</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AgentDashboard;
