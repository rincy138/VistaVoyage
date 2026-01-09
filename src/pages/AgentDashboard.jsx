import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AgentDashboard.css';

const AgentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [packages, setPackages] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        destination: '',
        price: '',
        duration: '',
        description: '',
        image_url: '',
        available_slots: 10
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Fetch packages on mount
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const token = localStorage.getItem('token');
            // For simplicity using the public GET all packages endpoint, 
            // ideally we filter by agent ID or have a dedicated endpoint /api/agent/packages
            const res = await fetch('/api/packages');
            const data = await res.json();

            // Client-side filter for demo purposes if backend doesn't filter
            // In production backend should handle this filtering mainly for security
            const myPackages = data.filter(pkg => pkg.agent_id === user.id);
            setPackages(myPackages);
        } catch (err) {
            console.error("Failed to fetch packages", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (formData.title.trim().length < 3) {
            setMessage('Title must be at least 3 characters long');
            return;
        }

        if (formData.destination.trim().length < 2) {
            setMessage('Destination must be at least 2 characters long');
            return;
        }

        if (parseFloat(formData.price) < 100) {
            setMessage('Price must be at least ₹100');
            return;
        }

        if (parseInt(formData.available_slots) < 1) {
            setMessage('Available slots must be at least 1');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/packages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to create package');

            setMessage('Package created successfully!');
            setFormData({
                title: '',
                destination: '',
                price: '',
                duration: '',
                description: '',
                image_url: '',
                available_slots: 10
            });
            fetchPackages(); // Refresh list
        } catch (err) {
            setMessage('Error creating package');
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
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setPackages(packages.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    return (
        <div className="dashboard-container" style={{ paddingTop: '100px' }}>
            <div className="dashboard-header">
                <h1>Agent Dashboard</h1>
                <p>Welcome, {user.name}</p>
            </div>

            <div className="dashboard-grid">
                {/* Create Package Form */}
                <div className="dashboard-card">
                    <h3 className="form-title">Create New Package</h3>
                    {message && <div style={{ color: 'var(--primary)', marginBottom: '10px' }}>{message}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input type="text" name="title" placeholder="Package Title" className="form-control" value={formData.title} onChange={handleInputChange} required />
                        <input type="text" name="destination" placeholder="Destination" className="form-control" value={formData.destination} onChange={handleInputChange} required />
                        <input type="number" name="price" placeholder="Price (₹)" className="form-control" value={formData.price} onChange={handleInputChange} required />
                        <input type="text" name="duration" placeholder="Duration (e.g. 5 days)" className="form-control" value={formData.duration} onChange={handleInputChange} />
                        <input type="text" name="image_url" placeholder="Image URL" className="form-control" value={formData.image_url} onChange={handleInputChange} />
                        <textarea name="description" placeholder="Description" className="form-control" rows="4" value={formData.description} onChange={handleInputChange}></textarea>

                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Package'}
                        </button>
                    </form>
                </div>

                {/* Package List */}
                <div className="dashboard-card">
                    <h3 className="form-title">Your Packages</h3>
                    {packages.length === 0 ? (
                        <p className="text-muted">No packages created yet.</p>
                    ) : (
                        <div className="package-list">
                            {packages.map(pkg => (
                                <div key={pkg.id} className="package-item">
                                    <div className="package-info">
                                        <h4>{pkg.title}</h4>
                                        <p>{pkg.destination} • ₹{pkg.price}</p>
                                    </div>
                                    <div className="package-actions">
                                        <button className="btn btn-sm btn-outline">Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(pkg.id)}>Delete</button>
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

export default AgentDashboard;
