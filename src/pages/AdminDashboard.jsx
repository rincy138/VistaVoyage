import { useState, useEffect } from 'react';
import './AgentDashboard.css'; // Reusing Agent styles for consistency

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            alert("Error fetching users: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });
            fetchUsers();
        } catch (err) {
            console.error("Failed to update role", err);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    console.log("Rendering AdminDashboard. Loading:", loading, "Users:", users.length);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'red', zIndex: 9999, color: 'white', overflow: 'auto' }}>
            <h1>DEBUG MODE ACTIVE</h1>
            <p>Loading: {String(loading)}</p>
            <p>Users Count: {users.length}</p>
            <button onClick={() => window.location.href = '/'}>Go Home</button>
            <div className="dashboard-container" style={{ paddingTop: '100px', width: '100%', position: 'relative', background: 'transparent' }}>
                <div className="dashboard-header">
                    <h1 style={{ color: 'white' }}>Admin Dashboard</h1>
                </div>

                <div className="dashboard-card">
                    <h3 className="form-title">User Management</h3>
                    {loading ? <p>Loading users...</p> : (
                        <div className="package-list">
                            {/* Header Row */}
                            <div className="package-item" style={{ background: 'rgba(255,255,255,0.1)', fontWeight: 'bold' }}>
                                <div style={{ width: '20%' }}>Name</div>
                                <div style={{ width: '30%' }}>Email</div>
                                <div style={{ width: '20%' }}>Role</div>
                                <div style={{ width: '30%' }}>Actions</div>
                            </div>

                            {users.map(user => (
                                <div key={user.id} className="package-item">
                                    <div style={{ width: '20%' }}>{user.name}</div>
                                    <div style={{ width: '30%' }}>{user.email}</div>
                                    <div style={{ width: '20%' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: user.role === 'Admin' ? 'var(--secondary)' :
                                                user.role === 'Agent' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            color: user.role === 'Admin' ? 'white' :
                                                user.role === 'Agent' ? 'black' : 'white',
                                            fontSize: '0.8rem'
                                        }}>
                                            {user.role}
                                        </span>
                                    </div>
                                    <div className="package-actions" style={{ width: '30%' }}>
                                        {user.role !== 'Admin' && (
                                            <>
                                                <select
                                                    className="form-control"
                                                    style={{ width: 'auto', padding: '4px', fontSize: '0.9rem' }}
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                >
                                                    <option value="Traveler">Traveler</option>
                                                    <option value="Agent">Agent</option>
                                                    <option value="Admin">Admin</option>
                                                </select>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
