import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Shield, ArrowLeft, Check, CreditCard, Smartphone, Globe, Wallet, Calendar, Lock } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onConfirm, amount }) => {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [upiId, setUpiId] = useState('');
    const [verified, setVerified] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, netbanking, wallet

    // UPI State
    const [verifiedName, setVerifiedName] = useState('');

    // NetBanking State
    const [bankSearch, setBankSearch] = useState('');
    const [selectedBank, setSelectedBank] = useState(null);
    const [bankUserId, setBankUserId] = useState('');

    // Card State
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');

    const [error, setError] = useState('');

    const checkBankList = [
        "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank",
        "Punjab National Bank", "Bank of Baroda", "Union Bank of India", "Canara Bank",
        "IndusInd Bank", "Yes Bank", "IDFC First Bank", "Federal Bank", "Indian Bank",
        "Bank of India", "Central Bank of India", "IDBI Bank", "South Indian Bank"
    ];

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setPaymentSuccess(false);
            setLoading(false);
            setUpiId('');
            setVerified(false);
            setVerifiedName('');
            setBankSearch('');
            setSelectedBank(null);
            setBankUserId('');
            setCardNumber('');
            setCardExpiry('');
            setCardCvc('');
            setCardName('');
            setError('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = (e) => {
        e.preventDefault();
        setError('');

        if (paymentMethod === 'upi') {
            const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,64}$/;
            if (!upiRegex.test(upiId)) {
                setError('Please enter a valid UPI ID (e.g., user@bank)');
                return;
            }
        }

        if (paymentMethod === 'netbanking') {
            if (bankUserId.trim().length < 3) {
                setError('Please enter a valid Customer/User ID');
                return;
            }
        }

        if (paymentMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16) {
                setError('Invalid Card Number');
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                setError('Invalid Expiry Date (MM/YY)');
                return;
            }
            if (cardCvc.length < 3) {
                setError('Invalid CVV');
                return;
            }
            if (!cardName.trim()) {
                setError('Card Holder Name is required');
                return;
            }
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPaymentSuccess(true);
            setTimeout(() => {
                onConfirm();
            }, 2000);
        }, 2000);
    };

    const handleVerify = () => {
        if (!upiId) return;
        setError('');

        const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,64}$/;
        if (!upiRegex.test(upiId)) {
            setError('Invalid UPI ID format');
            return;
        }

        setVerifying(true);
        // Simulate checking name from VPA
        // Logic: Extract name part before @ and capitalize
        const extractedName = upiId.split('@')[0].toUpperCase().replace(/[0-9.-]/g, ' ').trim();
        const displayName = extractedName.length > 0 ? extractedName : 'VERIFIED USER';

        setTimeout(() => {
            setVerifying(false);
            setVerified(true);
            setVerifiedName(displayName);
        }, 1500);
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value.replace(/\D/g, '');
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
        if (value.length <= 16) {
            setCardNumber(formattedValue);
            setError('');
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        if (value.length <= 5) {
            setCardExpiry(value);
            setError('');
        }
    };

    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        inset: 0
    };

    const modalStyle = {
        backgroundColor: '#fff',
        width: '90%',
        maxWidth: '750px', // Wider implementation for sidebar layout
        height: '500px',
        maxHeight: '90vh',
        borderRadius: '8px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'row', // Side-by-side layout
        overflow: 'hidden',
        zIndex: 100000,
        transform: 'none',
        opacity: 1,
        visibility: 'visible',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };

    const razorpayBlue = '#3395ff';
    const razorpayDark = '#0e1526';
    const sidebarGray = '#f1f4f6';

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                {paymentSuccess ? (
                    <div style={{ flex: 1, padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                        <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: '#10b981' }}>
                            <Check size={48} strokeWidth={3} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px', color: razorpayDark }}>Payment Successful!</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Your payment of <strong>₹{safeAmount.toLocaleString()}</strong> has been captured.</p>
                        <div style={{ width: '100%', maxWidth: '200px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: razorpayBlue, animation: 'loadingBar 2s linear' }}></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* LEFT SIDEBAR - Payment Methods */}
                        <div style={{ width: '280px', backgroundColor: sidebarGray, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <div style={{ width: '32px', height: '32px', background: razorpayBlue, color: 'white', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V</div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold', color: razorpayDark }}>VistaVoyage</h3>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Test Amount: ₹{safeAmount}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
                                <div style={{ padding: '0 15px 10px', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Payment Options</div>

                                {['upi', 'card', 'netbanking'].map(method => (
                                    <button
                                        key={method}
                                        onClick={() => { setPaymentMethod(method); setError(''); }}
                                        style={{
                                            width: '100%',
                                            padding: '12px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            border: 'none',
                                            background: paymentMethod === method ? 'white' : 'transparent',
                                            color: paymentMethod === method ? razorpayBlue : '#475569',
                                            fontWeight: paymentMethod === method ? '600' : '500',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            borderLeft: paymentMethod === method ? `4px solid ${razorpayBlue}` : '4px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {method === 'upi' && <Smartphone size={18} />}
                                        {method === 'card' && <CreditCard size={18} />}
                                        {method === 'netbanking' && <Globe size={18} />}
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {method === 'upi' ? 'UPI / QR' : method === 'netbanking' ? 'NetBanking' : 'Card'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: '15px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6 }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '14px' }} />
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Secured</span>
                            </div>
                        </div>

                        {/* RIGHT CONTENT - Active Form */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', position: 'relative' }}>
                            <button
                                onClick={onClose}
                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                            >
                                <X size={20} />
                            </button>

                            <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
                                <h2 style={{ margin: 0, fontSize: '1.1rem', color: razorpayDark }}>
                                    {paymentMethod === 'upi' && 'UPI / QR Payment'}
                                    {paymentMethod === 'card' && 'Add Card Details'}
                                    {paymentMethod === 'netbanking' && 'Select Bank'}
                                </h2>
                            </div>

                            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                                <form onSubmit={handlePayment} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    {paymentMethod === 'upi' && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                                                <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=upi://pay?pa=vista@ybl&am=${safeAmount}&tn=VistaVoyage%20Booking`} alt="QR" style={{ width: '100px', height: '100px', display: 'block' }} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#334155' }}>Scan QR Code</p>
                                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Open any UPI app to scan and pay.</p>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: 'auto' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>OR ENTER UPI ID</label>
                                                <div style={{ display: 'flex' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="username@bank"
                                                        value={upiId}
                                                        onChange={(e) => { setUpiId(e.target.value); setError(''); setVerified(false); }}
                                                        style={{ flex: 1, padding: '12px', border: error && paymentMethod === 'upi' ? '1px solid #ef4444' : '1px solid #cbd5e1', borderRadius: '4px 0 0 4px', fontSize: '0.95rem', outline: 'none' }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleVerify}
                                                        disabled={!upiId || verifying || verified}
                                                        style={{
                                                            padding: '0 20px',
                                                            background: '#f8fafc',
                                                            border: '1px solid #cbd5e1',
                                                            borderLeft: 'none',
                                                            borderRadius: '0 4px 4px 0',
                                                            cursor: verified ? 'default' : 'pointer',
                                                            color: verified ? '#10b981' : razorpayBlue,
                                                            fontWeight: '600',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        {verifying ? '...' : verified ? 'Verified' : 'Verify'}
                                                    </button>
                                                </div>

                                                {error && paymentMethod === 'upi' && <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: '0.8rem' }}>{error}</p>}

                                                {verified && <p style={{ margin: '8px 0 0', color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> Verified: {verifiedName}</p>}
                                            </div>
                                        </>
                                    )}

                                    {paymentMethod === 'card' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>CARD NUMBER</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        placeholder="0000 0000 0000 0000"
                                                        value={cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        maxLength={19}
                                                        style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '4px', border: error && error.includes('Card') ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                                    />
                                                    <CreditCard size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>EXPIRY DATE</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="MM / YY"
                                                            value={cardExpiry}
                                                            onChange={handleExpiryChange}
                                                            maxLength={5}
                                                            style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '4px', border: error && error.includes('Expiry') ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                                        />
                                                        <Calendar size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>CVV</label>
                                                    <div style={{ position: 'relative' }}>
                                                        <input
                                                            type="password"
                                                            placeholder="•••"
                                                            value={cardCvc}
                                                            onChange={(e) => { setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
                                                            maxLength={4}
                                                            style={{ width: '100%', padding: '12px 12px 12px 38px', borderRadius: '4px', border: error && error.includes('CVV') ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                                                        />
                                                        <Lock size={18} style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>CARD HOLDER NAME</label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter card holder name"
                                                    value={cardName}
                                                    onChange={(e) => { setCardName(e.target.value); setError(''); }}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '4px', border: error && error.includes('Name') ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', textTransform: 'uppercase' }}
                                                />
                                            </div>

                                            {error && paymentMethod === 'card' && <p style={{ margin: '0', color: '#ef4444', fontSize: '0.85rem' }}>{error}</p>}
                                        </div>
                                    )}

                                    {paymentMethod === 'netbanking' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            {!selectedBank ? (
                                                <>
                                                    <div style={{ marginBottom: '15px' }}>
                                                        <input
                                                            type="text"
                                                            placeholder="Search for your bank..."
                                                            value={bankSearch}
                                                            onChange={(e) => setBankSearch(e.target.value)}
                                                            style={{ width: '100%', padding: '12px 35px 12px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                                        />
                                                    </div>

                                                    <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                                                        {checkBankList.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())).map(bank => (
                                                            <div
                                                                key={bank}
                                                                onClick={() => setSelectedBank(bank)}
                                                                style={{
                                                                    padding: '12px 15px',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid #f1f5f9',
                                                                    background: 'white',
                                                                    color: '#334155',
                                                                    fontSize: '0.9rem',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                {bank}
                                                                <ChevronRight size={16} color="#cbd5e1" />
                                                            </div>
                                                        ))}
                                                        {checkBankList.filter(b => b.toLowerCase().includes(bankSearch.toLowerCase())).length === 0 && (
                                                            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>No banks found</div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setSelectedBank(null); setBankUserId(''); setError(''); }}
                                                            style={{ background: 'none', border: 'none', color: razorpayBlue, cursor: 'pointer', padding: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <ArrowLeft size={16} /> Back to banks
                                                        </button>
                                                    </div>

                                                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                                        <div style={{ width: '60px', height: '60px', background: '#e2e8f0', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Globe size={30} color="#64748b" />
                                                        </div>
                                                        <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', color: '#0f172a' }}>{selectedBank}</h3>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>Secure NetBanking Login</p>
                                                    </div>

                                                    <div style={{ marginBottom: 'auto' }}>
                                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: '#64748b' }}>CUSTOMER ID / USER ID</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Enter your Customer ID"
                                                            value={bankUserId}
                                                            onChange={(e) => { setBankUserId(e.target.value); setError(''); }}
                                                            style={{ width: '100%', padding: '14px', borderRadius: '6px', border: error && paymentMethod === 'netbanking' ? '1px solid #ef4444' : '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' }}
                                                        />
                                                        {error && paymentMethod === 'netbanking' && <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#ef4444' }}>{error}</p>}
                                                        <p style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
                                                            You will be redirected to the bank details page for authentication after clicking Pay.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || (paymentMethod === 'netbanking' && (!selectedBank || !bankUserId))}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            backgroundColor: (paymentMethod === 'netbanking' && (!selectedBank || !bankUserId)) ? '#cbd5e1' : razorpayBlue,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            cursor: (loading || (paymentMethod === 'netbanking' && (!selectedBank || !bankUserId))) ? 'not-allowed' : 'pointer',
                                            marginTop: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {loading ? 'Processing...' : `Pay ₹${safeAmount.toLocaleString()}`}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
