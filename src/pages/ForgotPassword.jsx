import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../components/Auth.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const onSubmit = async e => {
        e.preventDefault();

        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!emailRegex.test(email)) {
            setMessage('Please enter a valid email address');
            setError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setError(false);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setError(false);
                setOtpSent(true);
            } else {
                setMessage(data.message || 'Server error');
                setError(true);
            }
        } catch (err) {
            setMessage('Something went wrong. Please try again.');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const onVerifyOtp = async e => {
        e.preventDefault();
        if (otp.length !== 6) {
            setMessage('Please enter a 6-digit OTP');
            setError(true);
            return;
        }

        setLoading(true);
        setMessage('');
        setError(false);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Redirect to the reset password page with the secure token
                navigate(`/reset-password/${data.token}`);
            } else {
                setMessage(data.message || 'Invalid OTP');
                setError(true);
            }
        } catch (err) {
            setMessage('Verification failed. Please try again.');
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2 className="auth-title">{otpSent ? 'Verify OTP' : 'Reset Password'}</h2>

                {message && (
                    <div className={error ? "error-message" : "success-message"} style={!error ? {
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.5)',
                        color: '#6ee7b7',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    } : {}}>
                        {message}
                    </div>
                )}

                {!otpSent ? (
                    <form className="auth-form" onSubmit={onSubmit}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            Enter your email address and we'll send you a 6-digit OTP to reset your password.
                        </p>

                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={onVerifyOtp}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
                            We've sent an OTP to <strong>{email}</strong>. Enter it below to proceed.
                        </p>

                        <div className="form-group">
                            <label>6-Digit OTP</label>
                            <input
                                type="text"
                                className="form-control"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                required
                                placeholder="Enter 6-digit code"
                                style={{ textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify & Reset Password'}
                        </button>

                        <button
                            type="button"
                            className="btn-link"
                            style={{ background: 'none', border: 'none', color: '#3b82f6', marginTop: '15px', cursor: 'pointer', fontSize: '0.9rem' }}
                            onClick={() => setOtpSent(false)}
                        >
                            Back to Email Entry
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    Remember your password?
                    <Link to="/login" className="auth-link">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
