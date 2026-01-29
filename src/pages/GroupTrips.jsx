import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Calendar, ArrowRight, Link } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import StrictDate2026 from '../components/StrictDate2026';
import './GroupTrips.css';

const GroupTrips = () => {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    // Form States
    const [createForm, setCreateForm] = useState({ name: '', destination: '', startDate: '', endDate: '' });
    const [joinCode, setJoinCode] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTrips();

        // Check for join code in URL
        const params = new URLSearchParams(window.location.search);
        const joinCodeParam = params.get('join');
        if (joinCodeParam) {
            setJoinCode(joinCodeParam);
            setShowJoinModal(true);
        }
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await fetch('/api/groups/my-trips', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (res.ok) setTrips(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/groups/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(createForm)
            });

            // Try to parse JSON, if fails, use text
            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                // If text is HTML, it might be a server error page
                data = { message: text.substring(0, 100) + (text.length > 100 ? '...' : '') };
                console.error('Non-JSON response:', text);
            }

            if (res.ok) {
                setShowCreateModal(false);
                fetchTrips();
                navigate(`/group-trip/${data.tripId}`);
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert("Your session has expired. Please log in again.");
                    logout();
                    navigate('/login');
                    return;
                }
                setError(data.message || 'Server returned an error');
            }
        } catch (err) {
            console.error('Create Trip Exception:', err);
            setError(err.message || 'Failed to create trip');
        }
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ inviteCode: joinCode })
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await res.json();
            } else {
                const text = await res.text();
                data = { message: text.substring(0, 100) };
            }

            if (res.ok) {
                setShowJoinModal(false);
                fetchTrips();
                navigate(`/group-trip/${data.tripId}`);
            } else {
                if (res.status === 401 || res.status === 403) {
                    alert("Your session has expired. Please log in again.");
                    logout();
                    navigate('/login');
                    return;
                }
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to join trip');
        }
    };

    return (
        <div className="group-trips-page">
            <div className="container">
                <div className="group-header">
                    <h1>Group <span>Trips</span></h1>
                    <p style={{ color: '#cbd5e1', maxWidth: '600px' }}>
                        Plan perfect getaways with friends. Manage expenses, vote on itineraries, and keep everything organized in one place.
                    </p>

                    <div className="action-bar">
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={20} /> Create Group Trip
                        </button>
                        <button className="btn btn-outline" onClick={() => setShowJoinModal(true)}>
                            <Link size={20} /> Join with Code
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner">Loading your trips...</div>
                ) : trips.length > 0 ? (
                    <div className="trips-grid">
                        {trips.map(trip => (
                            <div key={trip.id} className="trip-card" onClick={() => navigate(`/group-trip/${trip.id}`)}>
                                <div className={`trip-status status-${trip.status || 'planning'}`}>
                                    {trip.status === 'locked' ? 'Locked 🔒' : 'Planning ✏️'}
                                </div>
                                <h3 className="trip-destination">{trip.destination}</h3>
                                <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#94a3b8' }}>{trip.name}</div>

                                <div className="trip-dates">
                                    <Calendar size={16} />
                                    <span>{new Date(trip.start_date).toLocaleDateString()}</span>
                                    <ArrowRight size={14} />
                                    <span>{new Date(trip.end_date).toLocaleDateString()}</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                                    <div className="member-avatars">
                                        {[...Array(Math.min(trip.member_count, 4))].map((_, i) => (
                                            <div key={i} className="avatar-circle">
                                                <Users size={14} />
                                            </div>
                                        ))}
                                        {trip.member_count > 4 && <div className="avatar-circle">+{trip.member_count - 4}</div>}
                                    </div>
                                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>View Dashboard →</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px' }}>
                        <Users size={48} style={{ color: 'var(--primary)', marginBottom: '20px' }} />
                        <h3>No Group Trips Yet</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>Start a new adventure with your friends today!</p>
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Your First Trip</button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Trip</h2>
                        {error && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>}
                        <form onSubmit={handleCreate}>
                            <div className="form-group-custom">
                                <label>Trip Name</label>
                                <input type="text" placeholder="e.g. Goa Graduation Trip" required
                                    value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
                            </div>
                            <div className="form-group-custom">
                                <label>Destination</label>
                                <input type="text" placeholder="e.g. Manali" required
                                    value={createForm.destination} onChange={e => setCreateForm({ ...createForm, destination: e.target.value })} />
                            </div>
                            <div className="form-group-custom" style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Start Date</label>
                                    <StrictDate2026
                                        name="startDate"
                                        value={createForm.startDate}
                                        onChange={e => setCreateForm({ ...createForm, startDate: e.target.value })}
                                        className="form-control-custom"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>End Date</label>
                                    <StrictDate2026
                                        name="endDate"
                                        value={createForm.endDate}
                                        onChange={e => setCreateForm({ ...createForm, endDate: e.target.value })}
                                        className="form-control-custom"
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Trip</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Join a Trip</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Enter the 6-character code shared by your friend.</p>
                        {error && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>}
                        <form onSubmit={handleJoin}>
                            <div className="form-group-custom">
                                <label>Invite Code</label>
                                <input type="text" placeholder="e.g. X7K9P2" required maxLength={6}
                                    style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '5px', textTransform: 'uppercase' }}
                                    value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowJoinModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Join Trip</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupTrips;
