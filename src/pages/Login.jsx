import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../components/Auth.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // In a real scenario this points to http://localhost:3000/api/auth/login
            const res = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data.user, data.token);

            // Redirect based on role
            if (data.user.role === 'Admin') navigate('/admin');
            else if (data.user.role === 'Agent') navigate('/agent');
            else navigate('/');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Welcome Back</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={email}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={password}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>Forgot Password?</Link>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?
                    <Link to="/register" className="auth-link">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
