import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import '../components/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Traveler' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, confirmPassword, role } = formData;

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

            if (!res.ok) {
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

        // Client-side validation
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters long');
            return;
        }

        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
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
                <h2 className="auth-title">Create Account</h2>

                {error && <div className="error-message">{error}</div>}

                <form className="auth-form" onSubmit={onSubmit} autoComplete="off">
                    {/* Dummy fields to trick browser autofill */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        <input type="text" name="dummy_email" tabIndex="-1" />
                        <input type="password" name="dummy_password" tabIndex="-1" />
                    </div>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            value={name}
                            onChange={onChange}
                            required
                            autoComplete="off"
                        />
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

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>I want to sign up as a:</label>
                        <select name="role" className="form-control" value={role} onChange={onChange}>
                            <option value="Traveler">Traveler</option>
                            <option value="Agent">Travel Agent</option>
                            {/* Admin registration usually restricted, but keeping for demo */}
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login" className="auth-link">Login</Link>
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

export default Register;
