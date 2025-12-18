import { useState, useEffect } from 'react';
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
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, agentsRes, destRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/agents/pending', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/admin/destinations', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();
            const agentsData = await agentsRes.json();
            const destData = await destRes.json();

            console.log("Admin Data Received:", { statsData, usersData, agentsData, destData });

            setStats(Array.isArray(statsData) ? statsData[0] : statsData);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setPendingAgents(Array.isArray(agentsData) ? agentsData : []);
            setDestinations(Array.isArray(destData) ? destData : []);
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
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{stats?.totalUsers ?? 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Agents</div>
                    <div className="stat-value">{stats?.totalAgents ?? 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Destinations</div>
                    <div className="stat-value">{stats?.totalDestinations ?? 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Bookings</div>
                    <div className="stat-value">{stats?.totalBookings ?? 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Revenue</div>
                    <div className="stat-value">₹{(stats?.totalRevenue ?? 0).toLocaleString()}</div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h2>Pending Agent Verifications</h2>
                </div>
                {(!pendingAgents || pendingAgents.length === 0) ? <p>No pending approvals</p> : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Agency</th>
                                <th>License</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingAgents.map(agent => (
                                <tr key={agent.id}>
                                    <td>{agent.name}</td>
                                    <td>{agent.agency_name}</td>
                                    <td>{agent.license_no}</td>
                                    <td>
                                        <button className="admin-btn btn-approve" onClick={() => handleApproveAgent(agent.id)}>Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="dashboard-section">
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

    const renderDestinations = () => (
        <div className="dashboard-section">
            <div className="section-header">
                <h2>Destinations</h2>
                <button className="admin-btn btn-approve">Add New</button>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(destinations) && destinations.map(dest => (
                        <tr key={dest.destination_id}>
                            <td>{dest.destination_name}</td>
                            <td>{dest.location}</td>
                            <td>
                                <button className="admin-btn btn-delete" onClick={() => { }}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-logo">VistaVoyage Admin</div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        Overview
                    </div>
                    <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        Users
                    </div>
                    <div className={`nav-item ${activeTab === 'destinations' ? 'active' : ''}`} onClick={() => setActiveTab('destinations')}>
                        Destinations
                    </div>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
                    <div className="admin-user-profile">
                        Admin User
                    </div>
                </header>

                {loading ? (
                    <div className="admin-loader">Loading Dashboard...</div>
                ) : (
                    <>
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'destinations' && renderDestinations()}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
