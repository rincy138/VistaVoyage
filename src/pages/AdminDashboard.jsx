import { useState, useEffect } from 'react';
import { Users, Globe, ShoppingBag, CreditCard, PieChart, TrendingUp, Search } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalAgents: 0,
        totalDestinations: 0,
        totalBookings: 0,
        totalRevenue: 0
    });
    const [users, setUsers] = useState([]);
    const [pendingAgents, setPendingAgents] = useState([]);
    const [destinations, setDestinations] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [revenueReports, setRevenueReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, agentsRes, destRes, bookingsRes, revenueRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/agents/pending', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/destinations', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/bookings', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/reports/revenue', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();
            const agentsData = await agentsRes.json();
            const destData = await destRes.json();
            const bookingsData = await bookingsRes.json();
            const revenueData = await revenueRes.json();

            setStats(Array.isArray(statsData) ? statsData[0] : statsData);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setPendingAgents(Array.isArray(agentsData) ? agentsData : []);
            setDestinations(Array.isArray(destData) ? destData : []);
            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            setRevenueReports(Array.isArray(revenueData) ? revenueData : []);
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveAgent = async (agentId) => {
        try {
            await fetch(`/api/admin/agents/${agentId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: 'Approved' })
            });
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to approve agent", err);
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

    const renderOverview = () => (
        <div className="tab-content">
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon-box"><Users size={24} color="var(--primary)" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Users</div>
                        <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-box"><Globe size={24} color="var(--secondary)" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Destinations</div>
                        <div className="stat-value">{stats?.totalDestinations ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-box"><ShoppingBag size={24} color="#ffc107" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Total Bookings</div>
                        <div className="stat-value">{stats?.totalBookings ?? 0}</div>
                    </div>
                </div>
                <div className="stat-card highlight">
                    <div className="stat-icon-box"><CreditCard size={24} color="#28a745" /></div>
                    <div className="stat-details">
                        <div className="stat-label">Revenue</div>
                        <div className="stat-value">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Recent Activities</h2>
                </div>
                <p style={{ color: '#a0a0a0' }}>No new system alerts. Everything is running smoothly.</p>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="dashboard-section table-section">
            <div className="section-header">
                <h2>User Management</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(users) && users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span className={`badge badge-${user.role?.toLowerCase()}`}>{user.role}</span>
                            </td>
                            <td>
                                {user.role !== 'Admin' && (
                                    <button className="admin-btn btn-delete" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBookings = () => (
        <div className="dashboard-section table-section">
            <div className="section-header">
                <h2>System-wide Bookings</h2>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Booking ID</th>
                        <th>User</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
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
                                <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderRevenue = () => (
        <div className="tab-content">
            <div className="stats-grid">
                <div className="stat-card">
                    <TrendingUp size={24} color="var(--primary)" />
                    <div className="stat-label">Total Earnings</div>
                    <div className="stat-value">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                </div>
            </div>
            <div className="dashboard-section table-section">
                <div className="section-header">
                    <h2>Revenue by Month</h2>
                </div>
                {revenueReports.length > 0 ? (
                    <div className="revenue-chart-list">
                        {revenueReports.map((report, idx) => (
                            <div key={idx} className="revenue-report-item">
                                <div className="report-month">{new Date(report.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
                                <div className="report-bar-container">
                                    <div
                                        className="report-bar"
                                        style={{ width: `${(report.revenue / stats.totalRevenue) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="report-amount">₹{report.revenue.toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No revenue data available yet.</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">VistaVoyage <span>Admin</span></div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <PieChart size={18} /> Overview
                    </div>
                    <div className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                        <ShoppingBag size={18} /> Bookings
                    </div>
                    <div className={`nav-item ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
                        <CreditCard size={18} /> Revenue
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
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'bookings' && renderBookings()}
                        {activeTab === 'revenue' && renderRevenue()}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
