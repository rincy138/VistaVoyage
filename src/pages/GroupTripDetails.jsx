import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, MapPin, Calendar, Lock, Unlock, CheckCircle,
    DollarSign, ThumbsUp, ThumbsDown, Plus, CreditCard, Copy, Link, MessageCircle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './GroupTrips.css';

const GroupTripDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    // Data State
    const [trip, setTrip] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [polls, setPolls] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState('member');

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, expenses, voting
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);

    // Forms
    const [expenseForm, setExpenseForm] = useState({ amount: '', description: '', splitType: 'equal' });
    const [pollForm, setPollForm] = useState({ title: '' });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchTripDetails();
    }, [id]);

    const fetchTripDetails = async () => {
        setError('');
        try {
            const res = await fetch(`/api/groups/${id}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    alert("Your session has expired. Please log in again.");
                    logout();
                    navigate('/login');
                    return;
                }
                if (res.status === 404) {
                    setError("Trip not found");
                    return;
                }
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Error ${res.status}: Failed to load trip`);
            }

            const data = await res.json();
            setTrip(data.trip);
            setMembers(data.members);
            setExpenses(data.expenses);
            setPolls(data.polls);
            setCurrentUserRole(data.currentUserRole);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(trip.invite_code);
        setStatusMsg({ type: 'success', text: 'Invite code copied!' });
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
    };

    const handleLockTrip = async () => {
        if (!window.confirm('Are you sure you want to lock this trip? No more changes will be allowed.')) return;
        try {
            const res = await fetch(`/api/groups/${id}/lock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchTripDetails();
                setStatusMsg({ type: 'success', text: 'Trip locked successfully!' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnlockTrip = async () => {
        if (!window.confirm('Are you sure you want to unlock this trip? Changes will be allowed again.')) return;
        try {
            const res = await fetch(`/api/groups/${id}/unlock`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                fetchTripDetails();
                setStatusMsg({ type: 'success', text: 'Trip unlocked! Planning resumed.' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/groups/${id}/expense`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(expenseForm)
            });
            if (res.ok) {
                setShowExpenseModal(false);
                setExpenseForm({ amount: '', description: '', splitType: 'equal' });
                fetchTripDetails();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/groups/${id}/poll`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(pollForm)
            });
            if (res.ok) {
                setShowPollModal(false);
                setPollForm({ title: '' });
                fetchTripDetails();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleVote = async (pollId, voteValue) => {
        if (trip.status === 'locked') return;
        try {
            await fetch(`/api/groups/${id}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ pollId, voteValue })
            });
            fetchTripDetails(); // Refresh to show new counts
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="group-trips-page">
            <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                <div className="loading-spinner">Loading dashboard...</div>
            </div>
        </div>
    );

    if (error) return (
        <div className="group-trips-page">
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <h2 style={{ color: '#ef4444' }}>Something went wrong</h2>
                <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>{error}</p>
                <button className="btn btn-primary" onClick={() => navigate('/group-trips')}>Go Back to Trips</button>
            </div>
        </div>
    );

    if (!trip) return (
        <div className="group-trips-page">
            <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <h2>Trip Not Found</h2>
                <button className="btn btn-primary" onClick={() => navigate('/group-trips')}>Go Back</button>
            </div>
        </div>
    );

    // Safety check for user (in case of logout transition)
    if (!user) {
        return (
            <div className="group-trips-page">
                <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
                    <div className="loading-spinner">Verifying user identity...</div>
                </div>
            </div>
        );
    }

    // Calculations
    const safeExpenses = Array.isArray(expenses) ? expenses : [];
    const userId = user?.id;
    const totalExpenses = safeExpenses.reduce((sum, ex) => sum + parseFloat(ex.amount || 0), 0);
    const mySpend = safeExpenses.filter(ex => ex.paid_by === userId).reduce((sum, ex) => sum + parseFloat(ex.amount || 0), 0);
    // Rough calc for equal split
    const memberCount = members && members.length > 0 ? members.length : 1;
    const perPersonShare = totalExpenses / memberCount;
    const balance = mySpend - perPersonShare;

    return (
        <div className="group-trips-page">
            <div className="container">
                {/* Dashboard Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{trip.destination}</h1>
                            {trip.status === 'locked' && (
                                <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    LOCKED 🔒
                                </span>
                            )}
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>{trip.name}</p>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px', color: '#cbd5e1' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={18} /> {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Users size={18} /> {members.length} Members
                            </span>
                        </div>
                    </div>

                    {currentUserRole === 'leader' && trip.status !== 'locked' && (
                        <button className="btn" style={{ background: '#ef4444', color: 'white' }} onClick={handleLockTrip}>
                            <Lock size={18} style={{ marginRight: '8px' }} /> Finalize & Lock Trip
                        </button>
                    )}

                    {currentUserRole === 'leader' && trip.status === 'locked' && (
                        <button className="btn" style={{ background: '#3b82f6', color: 'white' }} onClick={handleUnlockTrip}>
                            <Unlock size={18} style={{ marginRight: '8px' }} /> Unlock Trip
                        </button>
                    )}
                </div>

                {statusMsg.text && (
                    <div style={{
                        background: statusMsg.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: statusMsg.type === 'success' ? '#4ade80' : '#f87171',
                        padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid currentColor'
                    }}>
                        {statusMsg.text}
                    </div>
                )}

                <div className="dashboard-grid">
                    {/* Sidebar Nav */}
                    <div className="dash-sidebar">
                        <div className={`dash-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                            <Users size={20} /> Convert & Overview
                        </div>
                        <div className={`dash-nav-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => setActiveTab('expenses')}>
                            <DollarSign size={20} /> Expenses Split
                        </div>
                        <div className={`dash-nav-item ${activeTab === 'voting' ? 'active' : ''}`} onClick={() => setActiveTab('voting')}>
                            <CheckCircle size={20} /> Voting & Places
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="dash-content">

                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div>
                                <div className="invite-box">
                                    <span style={{ color: '#cbd5e1', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>INVITE FRIENDS WITH THIS CODE</span>
                                    <div className="code-display" style={{ fontSize: '2rem', letterSpacing: '4px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '15px' }}>
                                        {trip.invite_code}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <button className="btn btn-primary" style={{ fontSize: '0.9rem', flex: 1 }} onClick={handleCopyCode}>
                                            <Copy size={16} style={{ marginRight: '6px' }} /> Copy Code
                                        </button>
                                        <button className="btn btn-outline" style={{ fontSize: '0.9rem', flex: 1 }} onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/group-trips?join=${trip.invite_code}`);
                                            setStatusMsg({ type: 'success', text: 'Full invite link copied!' });
                                            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
                                        }}>
                                            <Link size={16} style={{ marginRight: '6px' }} /> Copy Link
                                        </button>
                                        <button className="btn" style={{ fontSize: '0.9rem', flex: 1, background: '#25D366', color: 'white', border: 'none' }} onClick={() => {
                                            const text = `Hey! Join my trip to ${trip.destination} on VistaVoyage! 🌍✈️\n\nUse code: *${trip.invite_code}*\nOr click here: ${window.location.origin}/group-trips?join=${trip.invite_code}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}>
                                            <MessageCircle size={16} style={{ marginRight: '6px' }} /> WhatsApp
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
                                        Share this code or link with friends so they can join this trip.
                                    </p>
                                </div>

                                <h3 className="section-head">Group Members</h3>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {members.map(member => (
                                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '15px' }}>
                                                {(member.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'white' }}>{member.name || 'Unknown User'} {member.id === user.id && '(You)'}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{member.role === 'leader' ? '👑 Group Leader' : 'Member'}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. EXPENSES TAB */}
                        {activeTab === 'expenses' && (
                            <div>
                                <div className="section-head">
                                    <h3>Expense Tracker</h3>
                                    {trip.status !== 'locked' && (
                                        <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
                                            <Plus size={18} /> Add Expense
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                        <div style={{ color: '#93c5fd', fontSize: '0.9rem' }}>Total Trip Cost</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#60a5fa' }}>₹{totalExpenses}</div>
                                    </div>
                                    <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                        <div style={{ color: '#86efac', fontSize: '0.9rem' }}>You Paid</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4ade80' }}>₹{mySpend}</div>
                                    </div>
                                    <div style={{ background: 'rgba(234, 179, 8, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                                        <div style={{ color: '#fde047', fontSize: '0.9rem' }}>Your Balance</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: balance >= 0 ? '#4ade80' : '#f87171' }}>
                                            {balance >= 0 ? '+' : ''}{balance.toFixed(0)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{balance >= 0 ? 'To receive' : 'To pay'}</div>
                                    </div>
                                </div>

                                <div className="expenses-list">
                                    {expenses.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center' }}>No expenses added yet.</p> : expenses.map(ex => (
                                        <div key={ex.id} className="expense-item">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                                    <CreditCard size={20} color="#cbd5e1" />
                                                </div>
                                                <div>
                                                    <div style={{ color: 'white', fontWeight: '500' }}>{ex.description}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Paid by {ex.payer_name} • {new Date(ex.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white' }}>₹{ex.amount}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. VOTING TAB */}
                        {activeTab === 'voting' && (
                            <div>
                                <div className="section-head">
                                    <h3>Voting & Itinerary</h3>
                                    {trip.status !== 'locked' && (
                                        <button className="btn btn-primary" onClick={() => setShowPollModal(true)}>
                                            <Plus size={18} /> Suggest Place
                                        </button>
                                    )}
                                </div>

                                {polls.length === 0 && <p style={{ color: '#94a3b8', textAlign: 'center' }}>No places suggested yet. Be the first!</p>}

                                {polls.map(poll => (
                                    <div key={poll.id} className="poll-card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'white' }}>{poll.title}</h4>
                                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>by {poll.suggester_name}</span>
                                        </div>

                                        <div className="poll-actions">
                                            <button
                                                className={`btn-vote vote-yes ${poll.userVote === 1 ? 'active' : ''}`}
                                                onClick={() => handleVote(poll.id, 1)}
                                                disabled={trip.status === 'locked'}
                                            >
                                                <ThumbsUp size={16} /> Yes ({poll.yesCount})
                                            </button>
                                            <button
                                                className={`btn-vote vote-no ${poll.userVote === -1 ? 'active' : ''}`}
                                                onClick={() => handleVote(poll.id, -1)}
                                                disabled={trip.status === 'locked'}
                                            >
                                                <ThumbsDown size={16} /> No ({poll.noCount})
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Models */}
            {showExpenseModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add Expense</h3>
                        <form onSubmit={handleAddExpense}>
                            <div className="form-group-custom">
                                <label>Description</label>
                                <input required type="text" placeholder="e.g. Dinner at Cafe"
                                    value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                            </div>
                            <div className="form-group-custom">
                                <label>Amount (₹)</label>
                                <input required type="number" placeholder="1000"
                                    value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPollModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Suggest a Place</h3>
                        <form onSubmit={handleCreatePoll}>
                            <div className="form-group-custom">
                                <label>Place / Activity Name</label>
                                <input required type="text" placeholder="e.g. Rohtang Pass"
                                    value={pollForm.title} onChange={e => setPollForm({ ...pollForm, title: e.target.value })} />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowPollModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Suggest</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupTripDetails;
