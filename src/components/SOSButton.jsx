import { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, MapPin, Phone, User, X, Loader2 } from 'lucide-react';
import './SOSButton.css';

const SOSButton = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, confirming, triggering, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [sosData, setSosData] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer;
        if (status === 'confirming' && countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        } else if (status === 'confirming' && countdown === 0) {
            handleFinalTrigger();
        }
        return () => clearInterval(timer);
    }, [status, countdown]);

    const reverseGeocode = async (lat, lng) => {
        try {
            if (lat === 0 && lng === 0) return 'Location Unknown';
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();
            return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (err) {
            console.warn('Reverse geocoding failed:', err);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    };

    const handleTriggerClick = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to use the SOS feature.');
            window.location.href = '/login';
            return;
        }
        setIsOpen(true);
        setStatus('confirming');
        setCountdown(5);
        setErrorMsg('');
        setLocationName('');
    };

    const handleCancel = () => {
        setStatus('idle');
        setCountdown(5);
    };

    const handleFinalTrigger = async () => {
        setStatus('triggering');

        try {
            // 1. Get Geolocation (Optional - don't let failure stop the SOS)
            let location = { lat: 0, lng: 0 };
            try {
                if (navigator.geolocation) {
                    const pos = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            timeout: 10000,
                            enableHighAccuracy: false
                        });
                    });
                    location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                }
            } catch (geoErr) {
                console.warn('Geolocation failed for SOS, proceeding without it:', geoErr);
            }

            // 2. Send SOS to Backend
            const token = localStorage.getItem('token');
            const res = await fetch('/api/sos/trigger', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    location,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSosData(data.data);
                setStatus('success');

                // 3. Get Place Name from coordinates
                if (location.lat !== 0 || location.lng !== 0) {
                    const name = await reverseGeocode(location.lat, location.lng);
                    setLocationName(name);
                }
            } else {
                // Handle session expiration/invalid token
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    alert('Your session has expired. Please login again to use the SOS feature.');
                    window.location.href = '/login';
                    return;
                }
                throw new Error(data.message || 'Server rejected the SOS signal');
            }
        } catch (err) {
            console.error('SOS Trigger Error:', err);
            setErrorMsg(err.message);
            setStatus('error');
        }
    };

    return (
        <>
            {/* Pulsing Floating Button */}
            <div
                className={`sos-floating-trigger ${status !== 'idle' ? 'active' : ''}`}
                onClick={() => status === 'idle' && handleTriggerClick()}
            >
                <div className="sos-pulse"></div>
                <AlertCircle size={28} />
                <span>SOS</span>
            </div>

            {/* Emergency Overlay */}
            {isOpen && (
                <div className="sos-overlay">
                    <div className="sos-modal glass-card">
                        <button className="sos-close" onClick={() => { setIsOpen(false); setStatus('idle'); setCountdown(5); }}><X /></button>

                        {status === 'confirming' && (
                            <div className="sos-step confirming">
                                <div className="sos-icon-large pulse">
                                    <ShieldAlert size={64} />
                                </div>
                                <h2>Emergency Signal</h2>
                                <p>Broadcasting your live location and trip details in...</p>
                                <div className="sos-countdown">{countdown}</div>
                                <button className="sos-cancel-btn" onClick={handleCancel}>CANCEL SIGNAL</button>
                            </div>
                        )}

                        {status === 'triggering' && (
                            <div className="sos-step triggering">
                                <Loader2 className="spinner" size={64} />
                                <h2>Broadcasting SOS...</h2>
                                <p>Alerting local agents and emergency response teams.</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="sos-step success">
                                <div className="sos-icon-large success-icon">
                                    <ShieldAlert size={64} />
                                </div>
                                <h2 className="success-text">SOS BROADCASTED</h2>
                                <p>Help is being coordinated. Stay where you are if safe.</p>

                                <div className="sos-details-preview">
                                    <div className="detail-item">
                                        <MapPin size={16} />
                                        <span>Location: {sosData?.location?.lat === 0 ? (
                                            <span className="error-text">GPS Blocked/Unavailable (Defaulting to 0,0)</span>
                                        ) : (
                                            locationName || `${sosData?.location?.lat.toFixed(4)}, ${sosData?.location?.lng.toFixed(4)}`
                                        )}</span>
                                    </div>
                                    <div className="detail-item">
                                        <User size={16} />
                                        <span>Traveler: {sosData?.traveler?.name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <Phone size={16} />
                                        <span>Emergency Contact:
                                            <span className={sosData?.traveler?.emergency_contact?.name === 'Not Set' ? 'error-text' : ''}>
                                                {sosData?.traveler?.emergency_contact?.name} ({sosData?.traveler?.emergency_contact?.phone})
                                            </span>
                                        </span>
                                    </div>
                                    {sosData?.traveler?.emergency_contact?.name === 'Not Set' && (
                                        <div className="sos-action-hint">
                                            <p>⚠️ Your emergency contact is not configured.</p>
                                            <button onClick={() => { setIsOpen(false); window.location.href = '/profile'; }}>Go to Profile to Set Contact</button>
                                        </div>
                                    )}
                                    {sosData?.agent && (
                                        <div className="detail-item highlight">
                                            <Phone size={16} />
                                            <span>Agent On Call: {sosData.agent.name} ({sosData.agent.phone})</span>
                                        </div>
                                    )}
                                </div>

                                <button className="sos-done-btn" onClick={() => setIsOpen(false)}>I AM NOW SAFE</button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="sos-step error">
                                <X size={64} color="#ef4444" />
                                <h2>Signal Failed</h2>
                                <p className="error-msg">{errorMsg || 'Please call emergency services (112) directly.'}</p>
                                <a href="tel:112" className="sos-call-btn">CALL EMERGENCY (112)</a>
                                <button className="sos-retry-btn" onClick={handleTriggerClick}>RETRY SOS</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default SOSButton;
