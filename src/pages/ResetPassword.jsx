import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../components/Auth.css';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const { token } = useParams();
    const navigate = useNavigate();

    const { password, confirmPassword } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setMessage({ text: 'Passwords do not match', type: 'error' });
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Reset failed');
            }

            setMessage({ text: 'Password reset successful! Redirecting to login...', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setMessage({ text: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">Create New Password</h2>

                {message.text && (
                    <div className={message.type === 'error' ? 'error-message' : 'success-message'} style={{
                        background: message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        border: message.type === 'error' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)',
                        color: message.type === 'error' ? '#fca5a5' : '#6ee7b7',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {message.text}
                    </div>
                )}

                <form className="auth-form" onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            value={password}
                            onChange={onChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            value={confirmPassword}
                            onChange={onChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="auth-footer">
                    Back to <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
