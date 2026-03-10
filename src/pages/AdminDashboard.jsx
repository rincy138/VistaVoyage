import { useState, useEffect } from 'react';
import { Users, Globe, ShoppingBag, PieChart, ShieldCheck, UserX, UserCheck, PackageCheck, PackageX, DollarSign, FileText, Download, BarChart2, TrendingUp, File } from 'lucide-react';
import { jsPDF } from 'jspdf';
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
    const [revenueReport, setRevenueReport] = useState([]);

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
            safeFetch('/api/admin/bookings', setBookings, []),
            safeFetch('/api/admin/reports/revenue', setRevenueReport, [])
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

    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const val = row[header] === null || row[header] === undefined ? '' : row[header];
                return `"${val.toString().replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadPDF = (data, title) => {
        if (!data || data.length === 0) return;

        const doc = new jsPDF('p', 'pt', 'a4');
        const margin = 40;
        let yPos = 60;

        // Title
        doc.setFontSize(20);
        doc.setTextColor(59, 130, 246);
        doc.text(`VistaVoyage - ${title}`, margin, yPos);
        yPos += 20;

        // Subtitle
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPos);
        yPos += 40;

        // Table Headers
        const headers = Object.keys(data[0]).filter(h => !h.includes('id') && !h.includes('token') && !h.includes('password'));
        const colWidth = (doc.internal.pageSize.getWidth() - (margin * 2)) / headers.length;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, yPos - 12, doc.internal.pageSize.getWidth() - (margin * 2), 20, 'F');

        headers.forEach((header, i) => {
            const hText = header.replace(/_/g, ' ').toUpperCase();
            doc.text(hText, margin + (i * colWidth), yPos);
        });
        yPos += 20;

        // Table Data
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);

        data.forEach((row, rowIndex) => {
            // New Page check
            if (yPos > doc.internal.pageSize.getHeight() - 60) {
                doc.addPage();
                yPos = 60;

                // Redraw headers on new page
                doc.setFont('helvetica', 'bold');
                doc.setFillColor(241, 245, 249);
                doc.rect(margin, yPos - 12, doc.internal.pageSize.getWidth() - (margin * 2), 20, 'F');
                headers.forEach((header, i) => {
                    doc.text(header.replace(/_/g, ' ').toUpperCase(), margin + (i * colWidth), yPos);
                });
                yPos += 20;
                doc.setFont('helvetica', 'normal');
            }

            // Alternating row background
            if (rowIndex % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(margin, yPos - 12, doc.internal.pageSize.getWidth() - (margin * 2), 20, 'F');
            }

            headers.forEach((header, i) => {
                let val = row[header] === null || row[header] === undefined ? '' : row[header];
                if (typeof val === 'object') val = JSON.stringify(val);

                // Truncate long strings
                const text = val.toString();
                const truncated = doc.splitTextToSize(text, colWidth - 10);
                doc.text(truncated[0] || '', margin + (i * colWidth), yPos);
            });
            yPos += 20;
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
        }

        doc.save(`${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-btn btn-approve" onClick={() => downloadCSV(users.filter(u => u.role === 'Agent'), 'agents_report')}>
                        <Download size={14} /> CSV
                    </button>
                    <button className="admin-btn btn-approve" style={{ background: '#6366f1' }} onClick={() => downloadPDF(users.filter(u => u.role === 'Agent'), 'Agents Report')}>
                        <File size={14} /> PDF
                    </button>
                </div>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-btn btn-approve" onClick={() => downloadCSV(users, 'users_report')}>
                        <Download size={14} /> CSV
                    </button>
                    <button className="admin-btn btn-approve" style={{ background: '#6366f1' }} onClick={() => downloadPDF(users, 'User Directory Report')}>
                        <File size={14} /> PDF
                    </button>
                </div>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-btn btn-approve" onClick={() => downloadCSV(destinations, 'destinations_report')}>
                        <Download size={14} /> CSV
                    </button>
                    <button className="admin-btn btn-approve" style={{ background: '#6366f1' }} onClick={() => downloadPDF(destinations, 'Destinations Report')}>
                        <File size={14} /> PDF
                    </button>
                </div>
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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-btn btn-approve" onClick={() => downloadCSV(filteredBookings, `${title.replace(/\s+/g, '_').toLowerCase()}_report`)}>
                        <Download size={14} /> CSV
                    </button>
                    <button className="admin-btn btn-approve" style={{ background: '#6366f1' }} onClick={() => downloadPDF(filteredBookings, `${title} Report`)}>
                        <File size={14} /> PDF
                    </button>
                </div>
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

    const renderReports = () => {
        const maxRevenue = Math.max(...revenueReport.map(r => r.revenue), 1);
        const userRoles = users.reduce((acc, u) => {
            acc[u.role] = (acc[u.role] || 0) + 1;
            return acc;
        }, {});

        const bookingStatus = bookings.reduce((acc, b) => {
            acc[b.status] = (acc[b.status] || 0) + 1;
            return acc;
        }, {});

        const itemTypeRevenue = bookings.reduce((acc, b) => {
            acc[b.item_type] = (acc[b.item_type] || 0) + b.total_amount;
            return acc;
        }, {});

        return (
            <div className="tab-content">
                <div className="reports-grid">
                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><TrendingUp size={20} /> Revenue Growth</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="admin-btn btn-approve" onClick={() => downloadCSV(revenueReport, 'revenue_growth_report')}>
                                    <Download size={14} /> CSV
                                </button>
                                <button className="admin-btn btn-approve" style={{ background: '#6366f1' }} onClick={() => downloadPDF(revenueReport, 'Revenue Growth Report')}>
                                    <File size={14} /> PDF
                                </button>
                            </div>
                        </div>
                        <div className="revenue-chart-list">
                            {revenueReport.map((item, idx) => (
                                <div key={idx} className="revenue-report-item">
                                    <div className="report-month">{new Date(item.month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</div>
                                    <div className="report-bar-container">
                                        <div className="report-bar" style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}></div>
                                    </div>
                                    <div className="report-amount">₹{item.revenue.toLocaleString()}</div>
                                </div>
                            ))}
                            {revenueReport.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>No revenue data yet.</p>}
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><Users size={20} /> User Composition</h2>
                        </div>
                        <div className="composition-grid">
                            {Object.entries(userRoles).map(([role, count]) => (
                                <div key={role} className="composition-card">
                                    <div className="comp-label">{role}s</div>
                                    <div className="comp-value">{count}</div>
                                    <div className="comp-percent">{Math.round((count / users.length) * 100)}% of total</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><ShoppingBag size={20} /> Booking Distribution</h2>
                        </div>
                        <div className="composition-grid">
                            {Object.entries(bookingStatus).map(([status, count]) => (
                                <div key={status} className="composition-card">
                                    <div className="comp-label">{status}</div>
                                    <div className="comp-value" style={{ color: status === 'Cancelled' ? '#ef4444' : '#10b981' }}>{count}</div>
                                    <div className="comp-percent">{Math.round((count / bookings.length) * 100)}% of total</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dashboard-section">
                        <div className="section-header">
                            <h2><BarChart2 size={20} /> Revenue by Type</h2>
                        </div>
                        <div className="composition-grid">
                            {Object.entries(itemTypeRevenue).map(([type, amount]) => (
                                <div key={type} className="composition-card">
                                    <div className="comp-label">{type}</div>
                                    <div className="comp-value">₹{amount.toLocaleString()}</div>
                                    <div className="comp-percent">{Math.round((amount / (stats.totalRevenue || 1)) * 100)}% of revenue</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
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
                    <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                        <FileText size={18} /> Reports
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
                        {activeTab === 'reports' && renderReports()}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
