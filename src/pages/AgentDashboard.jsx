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
        itinerary: '' // Stores JSON string
    });

    // Dynamic Itinerary State
    const [itineraryItems, setItineraryItems] = useState([{ day: 1, title: '', desc: '' }]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ totalBookings: 0, totalEarnings: 0, pendingRequests: 0, activePackages: 0 });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchAgentData();
        if (activeTab === 'packages') {
            fetchPackages();
        }
    }, [activeTab]);

    const fetchAgentData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/agent/dashboard', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error("Failed to fetch agent data", err);
        }
    };

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

        // Parse Itinerary for Builder
        try {
            const parsed = typeof pkg.itinerary === 'string' ? JSON.parse(pkg.itinerary) : pkg.itinerary;
            if (Array.isArray(parsed) && parsed.length > 0) {
                setItineraryItems(parsed);
            } else {
                setItineraryItems([{ day: 1, title: '', desc: '' }]);
            }
        } catch (e) {
            setItineraryItems([{ day: 1, title: '', desc: '' }]);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setIsEditing(false);
        setCurrentPkgId(null);
        setFormData({ title: '', destination: '', price: '', duration: '', description: '', image_url: '', available_slots: 10, itinerary: '' });
        setItineraryItems([{ day: 1, title: '', desc: '' }]);
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

            // Prepare Payload
            const payload = {
                ...formData,
                itinerary: JSON.stringify(itineraryItems)
            };

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Operation failed');
            }

            setMessage(isEditing ? 'Package updated successfully!' : 'Package created successfully!');
            handleReset();
            fetchPackages();
            fetchAgentData(); // Refresh active packages count
        } catch (err) {
            console.error("Error details:", err);
            setMessage(`Error: ${err.message}`);
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
            if (res.ok) {
                setPackages(packages.filter(p => p.id !== id));
                fetchAgentData();
            }
        } catch (err) { console.error(err); }
    };

    // Booking Actions (Real)
    const handleBookingAction = async (id, action) => {
        const status = action === 'accept' ? 'Confirmed' : 'Rejected'; // Mapping UI action to status
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/agent/bookings/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                // Update local state to reflect change immediately
                setBookings(prev => prev.map(b => {
                    if (b.id === id) return { ...b, status: status };
                    return b;
                }));
                fetchAgentData(); // Refresh stats
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to update booking');
            }
        } catch (err) {
            console.error("Error updating booking:", err);
            alert('Error updating booking status');
        }
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

            {/* Stats Overview */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Total Earnings</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2dd4bf' }}>₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Total Bookings</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{stats.totalBookings}</p>
                </div>
                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Pending Requests</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fbbf24' }}>{stats.pendingRequests}</p>
                </div>
                <div className="stat-card" style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '5px' }}>Active Packages</h4>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#818cf8' }}>{stats.activePackages}</p>
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

                                {/* Image Upload Section */}
                                <div className="image-upload-area" style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Package Cover Image</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-control"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData(prev => ({ ...prev, image_url: reader.result }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ padding: '8px', border: '1px dashed #666' }}
                                            />
                                            <input
                                                type="text"
                                                name="image_url"
                                                placeholder="OR Paste Image URL"
                                                className="form-control"
                                                value={formData.image_url}
                                                onChange={handleInputChange}
                                                style={{ marginTop: '10px' }}
                                            />
                                        </div>
                                        {formData.image_url && (
                                            <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444' }}>
                                                <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <textarea name="description" placeholder="Description" className="form-control" rows="3" value={formData.description} onChange={handleInputChange}></textarea>

                                {/* Itinerary Builder */}
                                <div className="itinerary-builder" style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#fbbf24' }}>Day-wise Itinerary</label>
                                    {itineraryItems.map((item, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                                            <div style={{ width: '60px', paddingTop: '10px', fontWeight: 'bold', color: '#94a3b8' }}>Day {index + 1}</div>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Title (e.g. Arrival in Munnar)"
                                                    value={item.title}
                                                    onChange={(e) => {
                                                        const newItems = [...itineraryItems];
                                                        newItems[index].title = e.target.value;
                                                        setItineraryItems(newItems);
                                                    }}
                                                />
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Activity description..."
                                                    value={item.desc}
                                                    onChange={(e) => {
                                                        const newItems = [...itineraryItems];
                                                        newItems[index].desc = e.target.value;
                                                        setItineraryItems(newItems);
                                                    }}
                                                ></textarea>
                                            </div>
                                            {itineraryItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setItineraryItems(itineraryItems.filter((_, i) => i !== index))}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '10px' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="btn btn-outline-sm"
                                        onClick={() => setItineraryItems([...itineraryItems, { day: itineraryItems.length + 1, title: '', desc: '' }])}
                                        style={{ marginTop: '5px', borderColor: '#fbbf24', color: '#fbbf24' }}
                                    >
                                        <Plus size={14} style={{ marginRight: '5px' }} /> Add Day
                                    </button>
                                </div>

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
                                                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                    {booking.customer_name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div>{booking.customer_name || 'Unknown'}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#aaa' }}>{booking.customer_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{booking.package_title}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>Travel: {booking.travel_date}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#aaa' }}>Booked: {booking.booking_date}</div>
                                        </td>
                                        <td>{booking.guests}</td>
                                        <td>₹{booking.total_amount?.toLocaleString()}</td>
                                        <td>
                                            <span className={`booking-status status-${booking.status?.toLowerCase() || 'pending'}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {(booking.status === 'Booked' || booking.status === 'Pending') && (
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
