import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Package, Calendar, Users, UserCheck, UserX, Briefcase, Plus, Edit, Trash2, CheckCircle, XCircle, Map, DollarSign, MessageSquare, Globe, Star } from 'lucide-react';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('packages');
    const [packages, setPackages] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [travelers, setTravelers] = useState([]);

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

    // Destination Form State
    const [isEditingDest, setIsEditingDest] = useState(false);
    const [currentDestId, setCurrentDestId] = useState(null);
    const [destFormData, setDestFormData] = useState({
        destination_name: '',
        location: '',
        description: '',
        image_url: ''
    });


    // Dynamic Itinerary State
    const [itineraryItems, setItineraryItems] = useState([{ day: 1, title: '', desc: '' }]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ totalBookings: 0, totalEarnings: 0, pendingRequests: 0, activePackages: 0 });
    const [bookings, setBookings] = useState([]);
    const [reviews, setReviews] = useState([
        { id: 1, user: "John Doe", rating: 5, comment: "Amazing experience with this package!", date: "2023-10-15" },
        { id: 2, user: "Sarah Smith", rating: 4, comment: "Great trip, but the hotel could be better.", date: "2023-11-02" }
    ]);
    const [messages, setMessages] = useState([
        { id: 1, user: "Alice Johnson", subject: "Trip Change Inquiry", status: "Unread", date: "2 hours ago" },
        { id: 2, user: "Bob Williams", subject: "Payment Confirmation", status: "Read", date: "1 day ago" }
    ]);

    // Tools State
    const [activeTool, setActiveTool] = useState(null);
    const [toolData, setToolData] = useState({ cost: 0, margin: 20, tax: 18, note: '', bookingRef: '' });

    // Booking Filters
    const [bookingFilter, setBookingFilter] = useState('All Status');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAgentData();
        if (activeTab === 'packages') {
            fetchPackages();
        }
        if (activeTab === 'destinations') {
            fetchDestinations();
        }
        if (activeTab === 'users') {
            fetchTravelers();
        }
        if (activeTab === 'messages') {
            fetchMessages();
        }
        if (activeTab === 'reviews') {
            fetchReviews();
        }
    }, [activeTab]);

    // ... (fetch logic remains same)

    // Filter Bookings Logic
    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = bookingFilter === 'All Status' || booking.status === bookingFilter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = (booking.customer_name?.toLowerCase() || '').includes(searchLower) ||
            (booking.id?.toString() || '').includes(searchLower);
        return matchesStatus && matchesSearch;
    });

    // ... (rest of handlers)

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

    const fetchDestinations = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/agent/destinations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setDestinations(data);
        } catch (err) {
            console.error("Failed to fetch destinations", err);
        }
    };

    const fetchTravelers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/agent/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setTravelers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch travelers", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/agent/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const fetchReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/agent/reviews', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleDestInputChange = (e) => {
        setDestFormData({ ...destFormData, [e.target.name]: e.target.value });
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

    const handleDestEdit = (dest) => {
        setIsEditingDest(true);
        setCurrentDestId(dest.destination_id);
        setDestFormData({
            destination_name: dest.destination_name,
            location: dest.location,
            description: dest.description || '',
            image_url: dest.image_url || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleReset = () => {
        setIsEditing(false);
        setCurrentPkgId(null);
        setFormData({ title: '', destination: '', price: '', duration: '', description: '', image_url: '', available_slots: 10, itinerary: '' });
        setItineraryItems([{ day: 1, title: '', desc: '' }]);
        setMessage('');
    };

    const handleDestReset = () => {
        setIsEditingDest(false);
        setCurrentDestId(null);
        setDestFormData({ destination_name: '', location: '', description: '', image_url: '' });
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

    const handleDestSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const url = `/api/agent/destinations/${currentDestId}`;
            // Only update allowed. Creation via request or admin usually, but we are editing CURRENT destinations.

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(destFormData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Operation failed');
            }

            setMessage('Destination updated successfully!');
            handleDestReset();
            fetchDestinations();
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

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/agent/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchTravelers();
        } catch (err) {
            console.error("Failed to update user status", err);
        }
    };

    const handleDeleteTraveler = async (userId) => {
        if (!confirm("Are you sure you want to delete this traveler account?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/agent/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchTravelers();
        } catch (err) {
            console.error("Failed to delete user", err);
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
                    className={`tab-btn ${activeTab === 'destinations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('destinations')}
                >
                    <Globe size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Manage Destinations
                </button>
                <button
                    className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tools')}
                >
                    <Map size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Itinerary Tools
                </button>
                <button
                    className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <MessageSquare size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Communication
                </button>
                <button
                    className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    <Star size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Reviews
                </button>
                <button
                    className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                    Manage Travelers
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
                                <div className="form-group-row">
                                    <input type="number" name="discount_price" placeholder="Discounted Price (Optional)" className="form-control" value={formData.discount_price || ''} onChange={handleInputChange} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc' }}>
                                        <input type="checkbox" name="seasonal_pricing" checked={formData.seasonal_pricing || false} onChange={handleInputChange} />
                                        <label>Enable Seasonal Pricing</label>
                                    </div>
                                </div>
                                <input type="text" name="duration" placeholder="Duration (e.g. 5 days)" className="form-control" value={formData.duration} onChange={handleInputChange} />
                                <textarea name="inclusions" placeholder="Inclusions & Exclusions (e.g. Flights, Meals included...)" className="form-control" rows="2" value={formData.inclusions || ''} onChange={handleInputChange}></textarea>

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

                {/* --- DESTINATIONS TAB --- */}
                {activeTab === 'destinations' && (
                    <div className="dashboard-grid">
                        <div className="dashboard-card">
                            <h3 className="form-title">Edit Destination Details</h3>
                            {message && <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>{message}</div>}

                            {!isEditingDest ? (
                                <p className="text-muted">Select a destination from the list on the right to edit its details.</p>
                            ) : (
                                <form className="auth-form" onSubmit={handleDestSubmit}>
                                    <div className="form-group">
                                        <label>Destination Name</label>
                                        <input type="text" name="destination_name" className="form-control" value={destFormData.destination_name} onChange={handleDestInputChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Location / State</label>
                                        <input type="text" name="location" className="form-control" value={destFormData.location} onChange={handleDestInputChange} required />
                                    </div>

                                    {/* Image Upload for Destination */}
                                    <div className="image-upload-area" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Destination Image</label>
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
                                                                setDestFormData(prev => ({ ...prev, image_url: reader.result }));
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
                                                    value={destFormData.image_url}
                                                    onChange={handleDestInputChange}
                                                    style={{ marginTop: '10px' }}
                                                />
                                            </div>
                                            {destFormData.image_url && (
                                                <div style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #444' }}>
                                                    <img src={destFormData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea name="description" className="form-control" rows="4" value={destFormData.description} onChange={handleDestInputChange}></textarea>
                                    </div>

                                    <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                                            {loading ? 'Saving...' : 'Update Destination'}
                                        </button>
                                        <button type="button" className="btn btn-secondary" onClick={handleDestReset}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="dashboard-card">
                            <h3 className="form-title">Available Destinations</h3>
                            <div className="search-bar-wrapper">
                                <input type="text" className="search-bar" placeholder="Search destinations..." />
                            </div>
                            {destinations.length === 0 ? (
                                <p className="text-muted">No destinations available.</p>
                            ) : (
                                <div className="package-list">
                                    {destinations.map(dest => (
                                        <div key={dest.destination_id} className="package-item">
                                            <div className="package-info" style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden' }}>
                                                    <img src={dest.image_url} alt={dest.destination_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div>
                                                    <h4 style={{ margin: 0 }}>{dest.destination_name}</h4>
                                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{dest.location}</p>
                                                </div>
                                            </div>
                                            <div className="package-actions">
                                                <button className="btn-icon" onClick={() => handleDestEdit(dest)} title="Edit Details"><Edit size={16} /></button>
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
                            <input
                                type="text"
                                className="search-bar"
                                placeholder="Search by customer name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['All', 'Booked', 'Confirmed', 'Cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setBookingFilter(status === 'All' ? 'All Status' : status)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            fontSize: '0.9rem',
                                            backgroundColor: bookingFilter === (status === 'All' ? 'All Status' : status) ? '#10b981' : 'rgba(255,255,255,0.05)',
                                            color: bookingFilter === (status === 'All' ? 'All Status' : status) ? 'white' : '#94a3b8',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
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
                                {filteredBookings.map(booking => (
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
                                                    <button className="btn-icon" title="Message" onClick={() => setActiveTab('messages')}><MessageSquare size={18} /></button>
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

                {/* --- MESSAGES TAB (New for Communication) --- */}
                {activeTab === 'messages' && (
                    <div className="dashboard-grid">
                        <div className="dashboard-card" style={{ flex: 1 }}>
                            <h3 className="form-title">Communication Center</h3>
                            <button className="btn btn-primary" style={{ marginBottom: '20px' }}>+ Compose Message</button>
                            <div className="messages-list">
                                {messages.map(msg => (
                                    <div key={msg.id} style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: msg.status === 'Unread' ? 'rgba(45, 212, 191, 0.05)' : 'transparent' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <h4 style={{ margin: 0 }}>{msg.sender_name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(msg.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ margin: 0, color: '#e2e8f0', fontWeight: '500' }}>{msg.subject}</p>
                                        <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{msg.message}</p>
                                        <span style={{ fontSize: '0.75rem', color: msg.status === 'Unread' ? '#fbbf24' : '#94a3b8' }}>{msg.status}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REVIEWS TAB (New for Ratings) --- */}
                {activeTab === 'reviews' && (
                    <div className="dashboard-card">
                        <h3 className="form-title">Traveler Reviews & Ratings</h3>
                        <div className="reviews-list">
                            {reviews.map(review => (
                                <div key={review.id} style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {review.user_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <h5 style={{ margin: 0 }}>{review.user_name}</h5>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{review.package_title}</div>
                                                <div style={{ display: 'flex', color: '#fbbf24', fontSize: '0.9rem' }}>
                                                    {[...Array(5)].map((_, i) => (<Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke={i < review.rating ? "none" : "currentColor"} />))}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(review.review_date).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ color: '#cbd5e1', fontStyle: 'italic', marginBottom: '15px' }}>"{review.review}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TOOLS TAB --- */}
                {activeTab === 'tools' && (
                    <div className="tools-grid">
                        <div className="tool-card">
                            <h4><Map size={20} /> Modify Itinerary</h4>
                            <p>Quickly adjust days, activities, or routes for active bookings.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTool('editor')}>Open Editor</button>
                        </div>
                        <div className="tool-card">
                            <h4><DollarSign size={20} /> Adjust Budget</h4>
                            <p>Update pricing for custom requests or calculate margins.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTool('budget')}>Budget Calculator</button>
                        </div>
                        <div className="tool-card">
                            <h4><MessageSquare size={20} /> Personalize Plans</h4>
                            <p>Add special notes, surprise events, or custom requests.</p>
                            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setActiveTool('notes')}>Add Note</button>
                        </div>
                    </div>
                )}

                {/* --- TOOL MODALS --- */}
                {activeTool && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000, backdropFilter: 'blur(5px)'
                    }}>
                        <div className="modal-content" style={{
                            background: '#1e293b', padding: '30px', borderRadius: '16px',
                            width: '90%', maxWidth: '500px', border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0, color: '#f8fafc' }}>
                                    {activeTool === 'editor' && 'Modify Itinerary'}
                                    {activeTool === 'budget' && 'Budget Calculator'}
                                    {activeTool === 'notes' && 'Personalize Plan'}
                                </h3>
                                <button onClick={() => setActiveTool(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <XCircle size={24} />
                                </button>
                            </div>

                            {activeTool === 'editor' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Select Booking</label>
                                    <select className="form-control" style={{ marginBottom: '15px' }}>
                                        <option>Select a booking...</option>
                                        {bookings.map(b => (
                                            <option key={b.id} value={b.id}>#{b.id} - {b.customer_name}</option>
                                        ))}
                                    </select>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Edit Itinerary Details</label>
                                    <textarea className="form-control" rows="5" defaultValue="Day 1: Arrival and Transfer..."></textarea>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }} onClick={() => { alert('Itinerary Updated!'); setActiveTool(null); }}>Save Changes</button>
                                </div>
                            )}

                            {activeTool === 'budget' && (
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Base Cost (₹)</label>
                                            <input type="number" className="form-control" value={toolData.cost} onChange={(e) => setToolData({ ...toolData, cost: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Margin (%)</label>
                                            <input type="number" className="form-control" value={toolData.margin} onChange={(e) => setToolData({ ...toolData, margin: parseInt(e.target.value) || 0 })} />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span>Subtotal:</span>
                                            <span>₹{toolData.cost + (toolData.cost * toolData.margin / 100)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#94a3b8' }}>
                                            <span>Tax (18%):</span>
                                            <span>₹{((toolData.cost + (toolData.cost * toolData.margin / 100)) * 0.18).toFixed(0)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.2rem', fontWeight: 'bold', color: '#2dd4bf' }}>
                                            <span>Final Price:</span>
                                            <span>₹{Math.round((toolData.cost + (toolData.cost * toolData.margin / 100)) * 1.18).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTool === 'notes' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Booking Reference</label>
                                    <input type="text" className="form-control" placeholder="#12345" value={toolData.bookingRef} onChange={(e) => setToolData({ ...toolData, bookingRef: e.target.value })} style={{ marginBottom: '15px' }} />

                                    <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>Special Note / Request</label>
                                    <textarea className="form-control" rows="4" placeholder="e.g. Needs wheelchair assistance, Vegetarian meal only..." value={toolData.note} onChange={(e) => setToolData({ ...toolData, note: e.target.value })}></textarea>

                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }} onClick={() => { alert('Note saved to profile!'); setActiveTool(null); }}>Add Note</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- USERS TAB (Manage Travelers) --- */}
                {activeTab === 'users' && (
                    <div className="dashboard-card">
                        <h3 className="form-title">Manage Traveler Accounts</h3>
                        <p className="section-desc" style={{ color: '#94a3b8', marginBottom: '20px' }}>Block/Unblock traveler accounts or remove them from the system.</p>
                        <table className="booking-table">
                            <thead>
                                <tr>
                                    <th>Traveler</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {travelers.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {t.name?.charAt(0)}
                                                </div>
                                                <span>{t.name}</span>
                                            </div>
                                        </td>
                                        <td>{t.email}</td>
                                        <td>
                                            <span className={`booking-status status-${(t.status || 'Active').toLowerCase()}`}>
                                                {t.status || 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btn-group">
                                                <button
                                                    className="btn-block-action"
                                                    onClick={() => handleToggleUserStatus(t.id, t.status || 'Active')}
                                                >
                                                    {t.status === 'Inactive' ? <UserCheck size={16} /> : <UserX size={16} />}
                                                    {t.status === 'Inactive' ? 'Unblock' : 'Block'}
                                                </button>
                                                <button
                                                    className="btn-delete-action"
                                                    onClick={() => handleDeleteTraveler(t.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {travelers.length === 0 && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No travelers found to manage.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentDashboard;
