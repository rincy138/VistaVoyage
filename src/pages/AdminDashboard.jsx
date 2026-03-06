import { useState, useEffect } from 'react';
import { Users, Globe, ShoppingBag, PieChart, ShieldCheck, UserX, UserCheck, PackageCheck, PackageX, DollarSign } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAgents: 0,
        totalDestinations: 0,
        totalBookings: 0
    });
    const [users, setUsers] = useState([]);
    const [pendingAgents, setPendingAgents] = useState([]);
    const [pendingPackages, setPendingPackages] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        const safeFetch = async (url, setter, defaultVal = []) => {
            try {
                const res = await fetch(url, { headers });
                if (!res.ok) throw new Error(`Status ${res.status}`);
                const data = await res.json();
                setter(data);
            } catch (err) {
                console.error(`Error fetching ${url}:`, err);
                setter(defaultVal);
            }
        };

        // Update stats and main lists
        await Promise.all([
            safeFetch('/api/admin/stats', (data) => setStats(Array.isArray(data) ? data[0] : data), { totalUsers: 0, totalAgents: 0, totalDestinations: 0, totalBookings: 0 }),
            safeFetch('/api/admin/users', (data) => setUsers(Array.isArray(data) ? data : []), []),
            safeFetch('/api/admin/agents/registrations', setPendingAgents, []),
            safeFetch('/api/admin/packages/pending', setPendingPackages, []),
            safeFetch('/api/admin/destinations', setDestinations, []),
            safeFetch('/api/admin/bookings', setBookings, [])
        ]);

        setLoading(false);
    };

    const handleToggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await fetch(`/api/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to update user status", err);
        }
    };

    const handleAgentApproval = async (agentId, approve) => {
        const newStatus = approve ? 'Active' : 'Inactive';
        const newRole = approve ? 'Agent' : 'Traveler';
        try {
            // Approving an agent makes them 'Active' and keeps role 'Agent'
            // Rejecting might downgrade them or just keep them 'Inactive'
            await fetch(`/api/admin/users/${agentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to process agent registration", err);
        }
    };

    const handlePackageModeration = async (packageId, approve) => {
        try {
            await fetch(`/api/admin/packages/${packageId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: approve ? 'Approved' : 'Rejected' })
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to moderate package", err);
        }
    };

    const handleProcessRefund = async (bookingId, status) => {
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}/refund`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                fetchDashboardData();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to process refund");
            }
        } catch (err) {
            console.error("Failed to process refund", err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const handleDeleteDestination = async (id) => {
        if (!confirm("Are you sure? This will delete the destination. Proceed?")) return;
        try {
            await fetch(`/api/admin/destinations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to delete destination", err);
        }
    };

    const renderOverview = () => (
        <div className="tab-content">
            <div className="stats-grid">
                <div className="stat-card clickable" onClick={() => setActiveTab('users')}>
                    <div className="stat-icon-box"><Users size={24} color="var(--primary)" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('destinations')}>
                    <div className="stat-icon-box"><Globe size={24} color="var(--secondary)" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Destinations</div>
                        <div className="stat-value">{stats?.totalDestinations ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('agents')}>
                    <div className="stat-icon-box"><Users size={24} color="#6f42c1" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Agents</div>
                        <div className="stat-value">{stats?.totalAgents ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card clickable" onClick={() => setActiveTab('bookings')}>
                    <div className="stat-icon-box"><ShoppingBag size={24} color="#ffc107" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Bookings</div>
                        <div className="stat-value">{stats?.totalBookings ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-box"><DollarSign size={24} color="#10b981" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section moderation-summary">
                <div className="section-header">
                    <h2>Pending Tasks</h2>
                </div>
                <div className="moderation-cards">
                    <div className="mod-card" onClick={() => setActiveTab('moderation')}>
                        <UserCheck size={20} />
                        <span>{pendingAgents.length} Agents Pending Approval</span>
                    </div>
                    <div className="mod-card" onClick={() => setActiveTab('moderation')}>
                        <PackageCheck size={20} />
                        <span>{pendingPackages.length} Packages Pending Approval</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAgents = () => (
        <div className="dashboard-section table-section">
            <div className="section-header">
                <h2>Agent Directory</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Agent Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.filter(user => user.role === 'Agent').map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`badge badge-${(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span>
                            </td>
                            <td>
                                <div className="admin-btn-group">
                                    <button
                                        className={`admin-btn ${user.status === 'Inactive' ? 'btn-approve' : 'btn-block'}`}
                                        onClick={() => handleToggleUserStatus(user.id, user.status || 'Active')}
                                    >
                                        {user.status === 'Inactive' ? <UserCheck size={14} /> : <UserX size={14} />}
                                        {user.status === 'Inactive' ? 'Unblock' : 'Block'}
                                    </button>
                                    <button className="admin-btn btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.filter(u => u.role === 'Agent').length === 0 && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No agents registered yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderAllUsers = () => (
        <div className="dashboard-section table-section">
            <div className="section-header">
                <h2>Traveler & User Directory</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{user.role}</span></td>
                            <td>
                                <span className={`badge badge-${(user.status || 'Active').toLowerCase()}`}>{user.status || 'Active'}</span>
                            </td>
                            <td>
                                <div className="admin-btn-group">
                                    <button
                                        className={`admin-btn ${user.status === 'Inactive' ? 'btn-approve' : 'btn-block'}`}
                                        onClick={() => handleToggleUserStatus(user.id, user.status || 'Active')}
                                    >
                                        {user.status === 'Inactive' ? <UserCheck size={14} /> : <UserX size={14} />}
                                        {user.status === 'Inactive' ? 'Unblock' : 'Block'}
                                    </button>
                                    <button className="admin-btn btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No users found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderModeration = () => (
        <div className="tab-content">
            <div className="dashboard-section table-section">
                <div className="section-header">
                    <h2>Approve or reject Travel Agent registrations</h2>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Agent Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingAgents.map(a => (
                            <tr key={a.id}>
                                <td>{a.name}</td>
                                <td>{a.email}</td>
                                <td>{new Date(a.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="admin-btn-group">
                                        <button className="admin-btn btn-approve" onClick={() => handleAgentApproval(a.id, true)}>Approve</button>
                                        <button className="admin-btn btn-delete" onClick={() => handleAgentApproval(a.id, false)}>Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pendingAgents.length === 0 && (
                            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No pending agent registrations.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="dashboard-section table-section" style={{ marginTop: '30px' }}>
                <div className="section-header">
                    <h2>Approve packages added by agents</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', opacity: 0.7 }}>Review packages before they go live</p>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Package Title</th>
                            <th>Agent</th>
                            <th>Destination</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingPackages.map(p => (
                            <tr key={p.id}>
                                <td>{p.title}</td>
                                <td>{p.agent_name}</td>
                                <td>{p.destination}</td>
                                <td>₹{p.price.toLocaleString()}</td>
                                <td>
                                    <div className="admin-btn-group">
                                        <button className="admin-btn btn-approve" onClick={() => handlePackageModeration(p.id, true)}>Approve</button>
                                        <button className="admin-btn btn-delete" onClick={() => handlePackageModeration(p.id, false)}>Reject</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pendingPackages.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No packages pending approval.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDestinations = () => (
        <div className="dashboard-section table-section">
            <div className="section-header">
                <h2>Destinations Explorer</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {destinations.map(d => (
                        <tr key={d.destination_id}>
                            <td><img src={d.image_url} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                            <td>{d.destination_name}</td>
                            <td>{d.location}</td>
                            <td>
                                <button className="admin-btn btn-delete" onClick={() => handleDeleteDestination(d.destination_id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBookingTable = (title, filteredBookings) => (
        <div className="dashboard-section table-section" style={{ marginBottom: '40px' }}>
            <div className="section-header">
                <h2>{title}</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>User</th>
                        <th>{title.includes('Package') ? 'Package' : (title.includes('Hotel') ? 'Hotel' : 'Taxi')}</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Booking Status</th>
                        <th>Refund Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map(b => (
                            <tr key={b.booking_id}>
                                <td>#VV-{b.booking_id}</td>
                                <td>
                                    <div>{b.user_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{b.user_email}</div>
                                </td>
                                <td>{b.package_name}</td>
                                <td>{new Date(b.travel_date).toLocaleDateString()}</td>
                                <td>₹{b.total_amount.toLocaleString()}</td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        background: b.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        color: b.status === 'Cancelled' ? '#ef4444' : '#10b981',
                                        fontWeight: '600'
                                    }}>
                                        {b.status}
                                    </span>
                                </td>
                                <td>
                                    {b.refund_status ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '50px',
                                                fontSize: '0.75rem',
                                                background: b.refund_status === 'Processing' ? 'rgba(245, 158, 11, 0.1)' : (b.refund_status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                                color: b.refund_status === 'Processing' ? '#f59e0b' : (b.refund_status === 'Completed' ? '#10b981' : '#ef4444'),
                                                fontWeight: '600',
                                                width: 'fit-content'
                                            }}>
                                                {b.refund_status} {b.refund_amount > 0 && `(₹${b.refund_amount})`}
                                            </span>
                                            {b.refund_status === 'Processing' && (
                                                <div className="admin-btn-group" style={{ marginTop: '5px' }}>
                                                    <button
                                                        className="admin-btn btn-approve"
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                        onClick={() => handleProcessRefund(b.booking_id, 'Completed')}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="admin-btn btn-delete"
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                        onClick={() => handleProcessRefund(b.booking_id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#888' }}>-</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
                                No {title.toLowerCase()} found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderBookings = () => {
        const packageBookings = bookings.filter(b => b.item_type === 'Package');
        const hotelBookings = bookings.filter(b => b.item_type === 'Hotel');
        const taxiBookings = bookings.filter(b => b.item_type === 'Taxi');

        return (
            <div className="tab-content">
                {renderBookingTable('Package Bookings', packageBookings)}
                {renderBookingTable('Hotel Bookings', hotelBookings)}
                {renderBookingTable('Taxi Bookings', taxiBookings)}
            </div>
        );
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">VistaVoyage <span>Admin</span></div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <PieChart size={18} /> Overview
                    </div>
                    <div className={`nav-item ${activeTab === 'moderation' ? 'active' : ''}`} onClick={() => setActiveTab('moderation')}>
                        <ShieldCheck size={18} /> Moderation
                    </div>
                    <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                        <ShoppingBag size={18} /> Bookings
                    </div>
                    <div className={`nav-item ${activeTab === 'destinations' ? 'active' : ''}`} onClick={() => setActiveTab('destinations')}>
                        <Globe size={18} /> Destinations
                    </div>
                    <div className={`nav-item ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>
                        <Users size={18} /> Agents
                    </div>
                    <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Users
                    </div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-title">
                        <p className="breadcrumb">VistaVoyage / Admin</p>
                        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    </div>
                    <div className="admin-profile-pill">
                        <div className="admin-avatar">A</div>
                        <span>Admin</span>
                    </div>
                </header>

                {loading ? (
                    <div className="admin-loader">
                        <div className="loader-pulse"></div>
                        <span>LOADING DATA...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'moderation' && renderModeration()}
                        {activeTab === 'agents' && renderAgents()}
                        {activeTab === 'users' && renderAllUsers()}
                        {activeTab === 'destinations' && renderDestinations()}
                        {activeTab === 'bookings' && renderBookings()}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
