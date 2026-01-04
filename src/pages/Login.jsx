import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
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

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const res = await fetch('/api/auth/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: credentialResponse.credential })
            });

            const data = await res.json();
            console.log('Google Login Response:', data);

            if (!res.ok) {
                console.error('Google Login Error Data:', data);
                throw new Error(data.message || 'Google Login failed');
            }

            login(data.user, data.token);

            // Redirect based on role
            if (data.user.role === 'Admin') navigate('/admin');
            else if (data.user.role === 'Agent') navigate('/agent');
            else navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // In a real scenario this points to http://localhost:3000/api/auth/login
            const res = await fetch('/api/auth/login', {
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
                <h2 className="auth-title">Signin to VistaVoyage</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={onSubmit} autoComplete="off">
                    {/* Dummy fields to trick browser autofill */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <input type="text" name="dummy_email" tabIndex="-1" />
                        <input type="password" name="dummy_password" tabIndex="-1" />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={email}
                            onChange={onChange}
                            required
                            autoComplete="off"
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

                    <div className="forgot-password-container">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Don't have an account? </span>
                    <Link to="/register" className="auth-link">Register</Link>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => setError('Google Login Failed')}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
