import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, MapPin, Calendar, Lock, Unlock, CheckCircle,
    DollarSign, ThumbsUp, ThumbsDown, Plus, CreditCard, Copy, Link, MessageCircle, Trash2, UserMinus, Mail
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
    const [messages, setMessages] = useState([]);
    const [checklist, setChecklist] = useState([]);
    const [currentUserRole, setCurrentUserRole] = useState('member');

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('overview'); // overview, expenses, voting, communication
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);

    // Forms
    const [expenseForm, setExpenseForm] = useState({ amount: '', description: '', splitType: 'equal' });
    const [pollForm, setPollForm] = useState({ title: '' });
    const [messageInput, setMessageInput] = useState('');
    const [checklistItemInput, setChecklistItemInput] = useState('');
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
            setMessages(data.messages || []);
            setChecklist(data.checklist || []);
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

    const handleDeletePoll = async (pollId) => {
        if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
        try {
            const res = await fetch(`/api/groups/${id}/poll/${pollId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                // remove from local state immediately
                setPolls(prev => prev.filter(p => p.id !== pollId));
                setStatusMsg({ type: 'success', text: 'Suggestion deleted.' });
                setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
            } else {
                alert("Failed to delete suggestion");
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting suggestion");
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member? This will remove their votes but keep their expense records.")) return;
        try {
            const res = await fetch(`/api/groups/${id}/member/${memberId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                setMembers(prev => prev.filter(m => m.id !== memberId));
                setStatusMsg({ type: 'success', text: 'Member removed successfully.' });
                setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
            } else {
                const data = await res.json();
                alert(data.message || "Failed to remove member");
            }
        } catch (err) {
            console.error(err);
            alert("Error removing member");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        try {
            const res = await fetch(`/api/groups/${id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message: messageInput })
            });
            if (res.ok) {
                setMessageInput('');
                fetchTripDetails();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddChecklist = async (e) => {
        e.preventDefault();
        if (!checklistItemInput.trim()) return;
        try {
            const res = await fetch(`/api/groups/${id}/checklist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ title: checklistItemInput })
            });
            if (res.ok) {
                setChecklistItemInput('');
                fetchTripDetails();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleChecklist = async (itemId, currentStatus) => {
        try {
            const res = await fetch(`/api/groups/${id}/checklist/${itemId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ completed: !currentStatus })
            });
            if (res.ok) {
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
                            <ThumbsUp size={20} /> Itinerary Voting
                        </div>
                        <div className={`dash-nav-item ${activeTab === 'communication' ? 'active' : ''}`} onClick={() => setActiveTab('communication')}>
                            <MessageCircle size={20} /> Chat & Notes
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
                                            const shareUrl = `${window.location.origin}/group-trips?join=${trip.invite_code}`;
                                            const text = `${shareUrl}\n\nHey! Join my trip to ${trip.destination} on VistaVoyage! 🌍✈️\n\nInvite Code: ${trip.invite_code}`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}>
                                            <MessageCircle size={16} style={{ marginRight: '6px' }} /> WhatsApp
                                        </button>
                                        <button className="btn" style={{ fontSize: '0.9rem', flex: 1, background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => {
                                            const shareUrl = `${window.location.origin}/group-trips?join=${trip.invite_code}`;
                                            const subject = encodeURIComponent(`VistaVoyage Invite: Trip to ${trip.destination}`);
                                            const body = encodeURIComponent(`${shareUrl}\n\nHey!\n\nJoin my trip to ${trip.destination} on VistaVoyage! 🌍✈️\n\nInvite Code: ${trip.invite_code}\n\nLet's plan together!\n\nSent via VistaVoyage`);
                                            // Using Gmail web interface allows users to easily choose which account to send from
                                            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
                                            window.open(gmailUrl, '_blank');
                                        }}>
                                            <Mail size={16} style={{ marginRight: '6px' }} /> Email
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '15px', textAlign: 'center' }}>
                                        Full Invite Link (Click to Test):<br />
                                        <a
                                            href={`${window.location.origin}/group-trips?join=${trip.invite_code}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#3b82f6', textDecoration: 'underline', wordBreak: 'break-all', fontWeight: '600' }}
                                        >
                                            {window.location.origin}/group-trips?join={trip.invite_code}
                                        </a>
                                    </p>
                                </div>

                                <h3 className="section-head">Group Members</h3>
                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {members.map(member => (
                                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '15px' }}>
                                                    {(member.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: 'white' }}>{member.name || 'Unknown User'} {member.id === user.id && '(You)'}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{member.role === 'leader' ? '👑 Group Leader' : 'Member'}</div>
                                                </div>
                                            </div>
                                            {currentUserRole === 'leader' && member.id !== user.id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#94a3b8',
                                                        cursor: 'pointer',
                                                        padding: '8px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                                                    onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                                                    title="Remove Member"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            )}
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
                                    <h3>Itinerary Voting</h3>
                                    {trip.status !== 'locked' && (
                                        <button className="btn btn-primary" onClick={() => setShowPollModal(true)}>
                                            <Plus size={18} /> Suggest Place
                                        </button>
                                    )}
                                </div>
                                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Suggest destinations or activities and vote on them to build the final itinerary.</p>

                                <div style={{ display: 'grid', gap: '15px' }}>
                                    {polls.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No suggestions yet. Be the first to suggest a place!</p> : polls.map(poll => (
                                        <div key={poll.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>{poll.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Suggested by {poll.suggester_name}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <button
                                                    onClick={() => handleVote(poll.id, 1)}
                                                    className={`vote-btn ${poll.userVote === 1 ? 'voted-yes' : ''}`}
                                                    disabled={trip.status === 'locked'}
                                                    style={{
                                                        background: poll.userVote === 1 ? '#22c55e' : 'rgba(34, 197, 94, 0.1)',
                                                        color: poll.userVote === 1 ? 'white' : '#4ade80',
                                                        border: 'none', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <ThumbsUp size={16} /> {poll.yesCount}
                                                </button>
                                                <button
                                                    onClick={() => handleVote(poll.id, -1)}
                                                    className={`vote-btn ${poll.userVote === -1 ? 'voted-no' : ''}`}
                                                    disabled={trip.status === 'locked'}
                                                    style={{
                                                        background: poll.userVote === -1 ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                                                        color: poll.userVote === -1 ? 'white' : '#f87171',
                                                        border: 'none', padding: '8px 15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    <ThumbsDown size={16} /> {poll.noCount}
                                                </button>
                                                {(currentUserRole === 'leader' || poll.suggested_by === user.id) && (
                                                    <button onClick={() => handleDeletePoll(poll.id)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', marginLeft: '10px' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. COMMUNICATION TAB */}
                        {activeTab === 'communication' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                                {/* Chat Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ margin: 0 }}>Group Chat</h3>
                                    </div>
                                    <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {messages.length === 0 ? <p style={{ color: '#64748b', textAlign: 'center' }}>No messages yet. Start the conversation!</p> : messages.map((msg, i) => (
                                            <div key={i} style={{
                                                alignSelf: msg.user_id === user.id ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%',
                                                background: msg.user_id === user.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                                color: msg.user_id === user.id ? 'black' : 'white',
                                                padding: '12px 16px', borderRadius: '16px', position: 'relative'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginBottom: '4px' }}>{msg.sender_name}</div>
                                                <div>{msg.message}</div>
                                                <div style={{ fontSize: '0.6rem', opacity: 0.5, textAlign: 'right', marginTop: '4px' }}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleSendMessage} style={{ padding: '20px', display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '12px 18px', color: 'white' }}
                                        />
                                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>Send</button>
                                    </form>
                                </div>

                                {/* Checklist Section */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', alignSelf: 'start' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Shared Checklist</h3>
                                    <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                                        {checklist.length === 0 ? <p style={{ color: '#64748b' }}>No items yet.</p> : checklist.map(item => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={item.completed === 1}
                                                    onChange={() => handleToggleChecklist(item.id, item.completed === 1)}
                                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                                />
                                                <span style={{ color: item.completed ? '#64748b' : 'white', textDecoration: item.completed ? 'line-through' : 'none' }}>
                                                    {item.title}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <form onSubmit={handleAddChecklist} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Add item..."
                                            value={checklistItemInput}
                                            onChange={(e) => setChecklistItemInput(e.target.value)}
                                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '10px 14px', color: 'white', fontSize: '0.9rem' }}
                                        />
                                        <button type="submit" className="btn btn-outline" style={{ padding: '10px' }}><Plus size={18} /></button>
                                    </form>
                                </div>
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
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '15px' }}>Add a destination or activity for the group to vote on.</p>
                        <form onSubmit={handleCreatePoll}>
                            <div className="form-group-custom">
                                <label>Place Name</label>
                                <input required type="text" placeholder="e.g. Baga Beach"
                                    value={pollForm.title} onChange={e => setPollForm({ ...pollForm, title: e.target.value })} />
                            </div>
                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowPollModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default GroupTripDetails;
