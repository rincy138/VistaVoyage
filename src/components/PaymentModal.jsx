import React, { useState } from 'react';
import { CreditCard, Wallet, Landmark, X, Smartphone, ChevronRight, Shield, ArrowLeft } from 'lucide-react';
import './PaymentModal.css';

const PaymentModal = ({ isOpen, onClose, onConfirm, amount }) => {
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [loading, setLoading] = useState(false);
    const [bankSearch, setBankSearch] = useState('');
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

    const banks = [
        { name: 'HDFC Bank', id: 'hdfc', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/512px-HDFC_Bank_Logo.svg.png' },
        { name: 'State Bank of India', id: 'sbi', logo: 'https://vignette.wikia.nocookie.net/logopedia/images/4/47/State_Bank_of_India.svg' },
        { name: 'ICICI Bank', id: 'icici', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/ICICI_Bank_Logo.svg/512px-ICICI_Bank_Logo.svg.png' },
        { name: 'Axis Bank', id: 'axis', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Axis_Bank_logo.svg/512px-Axis_Bank_logo.svg.png' },
        { name: 'Kotak Mahindra Bank', id: 'kotak', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Kotak_Mahindra_Bank_logo.svg/512px-Kotak_Mahindra_Bank_logo.svg.png' },
        { name: 'Bank of Baroda', id: 'bob', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Bank_of_Baroda_logo.svg/1024px-Bank_of_Baroda_logo.svg.png' },
        { name: 'Yes Bank', id: 'yes', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/Yes_Bank_logo.svg/1200px-Yes_Bank_logo.svg.png' },
        { name: 'IndusInd Bank', id: 'indusind', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/IndusInd_Bank_Logo.png' },
        { name: 'Punjab National Bank', id: 'pnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/PNB_Logo.png' },
        { name: 'Canara Bank', id: 'canara', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Canara_Bank_Logo.png' },
        { name: 'Union Bank of India', id: 'union', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Union_Bank_of_India_logo.png' },
        { name: 'South Indian Bank', id: 'sib', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/South_Indian_Bank_logo.svg/512px-South_Indian_Bank_logo.svg.png' }
    ];

    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase())
    );

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePayment = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            onConfirm();
        }, 2000);
    };

    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-container">
                <button className="close-modal-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className="payment-gateway-branding">
                    <button className="back-modal-btn" onClick={onClose}>
                        <ArrowLeft size={24} />
                    </button>
                    <div className="gateway-title">
                        <h3>Payment Details</h3>
                        <p>order_id_vv_419833</p>
                    </div>
                </div>

                <div className="payment-amount-banner">
                    <div className="amount-label">Amount to Pay</div>
                    <div className="amount-value">₹{amount.toLocaleString()}</div>
                </div>

                <div className="payment-methods-tabs">
                    <div
                        className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('upi')}
                    >
                        <Smartphone size={32} />
                        <span>UPI</span>
                        <div className="app-icons-mini">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" alt="PhonePe" />
                        </div>
                    </div>
                    <div
                        className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('card')}
                    >
                        <CreditCard size={32} />
                        <span>Cards</span>
                        <div className="app-icons-mini">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" alt="Visa" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/512px-Mastercard-logo.svg.png" alt="MC" />
                        </div>
                    </div>
                    <div
                        className={`method-tab ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('netbanking')}
                    >
                        <Landmark size={32} />
                        <span>NetBanking</span>
                    </div>
                </div>

                <form onSubmit={handlePayment} className="gateway-form">
                    {paymentMethod === 'upi' && (
                        <div className="upi-gateway">
                            <div className="upi-apps-grid">
                                <div className="upi-app-item">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" />
                                    <span>Google Pay</span>
                                </div>
                                <div className="upi-app-item active">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.svg/512px-PhonePe_Logo.svg.png" alt="PhonePe" />
                                    <span>PhonePe</span>
                                </div>
                                <div className="upi-app-item">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/512px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" />
                                    <span>Paytm</span>
                                </div>
                            </div>

                            <div className="upi-qr-box">
                                <div className="qr-wrapper">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=vista@ybl&am=${amount}&tn=VistaVoyage%20Booking`} alt="UPI QR" />
                                    <div className="qr-logo-overlay">
                                        <img src="https://www.bhimupi.org.in/assets/images/bhim-logo.png" alt="BHIM" />
                                    </div>
                                </div>
                                <p>Scan QR with any UPI app to pay</p>
                            </div>

                            <div className="upi-vpa-input">
                                <label>Or Pay via UPI ID</label>
                                <div className="vpa-field">
                                    <input type="text" placeholder="username@bankid" required />
                                    <button type="button">Verify</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'card' && (
                        <div className="card-gateway">
                            <div className="card-mockup">
                                <div className="card-chip"></div>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/512px-Visa_Inc._logo.svg.png" className="card-brand" alt="Visa" />
                                <div className="card-number-display">4532 XXXX XXXX XXXX</div>
                                <div className="card-footer">
                                    <div className="card-holder">
                                        <span className="label">Card Holder</span>
                                        <span className="value">ALEX JOHNSON</span>
                                    </div>
                                    <div className="card-expiry">
                                        <span className="label">Expires</span>
                                        <span className="value">12/28</span>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-input-group">
                                <label>Card Number</label>
                                <input type="text" placeholder="4532 XXXX XXXX XXXX" required maxLength="19" />
                            </div>
                            <div className="payment-row">
                                <div className="payment-input-group">
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder="MM/YY" required maxLength="5" />
                                </div>
                                <div className="payment-input-group">
                                    <label>CVV</label>
                                    <input type="password" placeholder="***" required maxLength="3" />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                        <div className="netbanking-gateway">
                            <div className="popular-banks">
                                <label>Popular Banks</label>
                                <div className="banks-grid">
                                    {banks.slice(0, 3).map(bank => (
                                        <div key={bank.id} className="bank-item" onClick={() => setBankSearch(bank.name)}>
                                            <img src={bank.logo} alt={bank.name} />
                                            <span>{bank.id.toUpperCase()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bank-search-container">
                                <label>Search All Banks</label>
                                <div className="searchable-dropdown" onBlur={() => setTimeout(() => setIsBankDropdownOpen(false), 200)}>
                                    <div className="vpa-field" onClick={() => setIsBankDropdownOpen(true)}>
                                        <input
                                            type="text"
                                            placeholder="Type to search your bank..."
                                            value={bankSearch}
                                            onChange={(e) => {
                                                setBankSearch(e.target.value);
                                                setIsBankDropdownOpen(true);
                                            }}
                                        />
                                    </div>
                                    {isBankDropdownOpen && (
                                        <div className="bank-dropdown-menu">
                                            {filteredBanks.map(bank => (
                                                <div
                                                    key={bank.id}
                                                    className="bank-dropdown-item"
                                                    onClick={() => {
                                                        setBankSearch(bank.name);
                                                        setIsBankDropdownOpen(false);
                                                    }}
                                                >
                                                    <img src={bank.logo} alt="" className="item-logo" />
                                                    <span>{bank.name}</span>
                                                </div>
                                            ))}
                                            {filteredBanks.length === 0 && (
                                                <div className="no-match">No banks found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="payment-submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="loader-text">Securing Payment...</span>
                        ) : (
                            <>
                                <span>Pay ₹{amount.toLocaleString()}</span>
                                <ChevronRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="payment-footer-badges">
                        <div className="badge"><Shield size={12} /> PCI DSS Compliant</div>
                        <div className="badge">128-bit SSL Secured</div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
