import { useState, useEffect, useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, LogOut, Tag, Hotel, Car, Home, Map, Briefcase, Package, Users, Lock, MessageSquare } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMenu = () => setIsMobileMenuOpen(false);
    const toggleProfileMenu = () => setShowProfileMenu(!showProfileMenu);

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container nav-container">
                <Link to="/" className="nav-logo" onClick={closeMenu}>
                    <Globe size={32} color="var(--primary)" />
                    Vista<span>Voyage</span>
                </Link>

                <div className="nav-toggle" onClick={toggleMenu}>
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </div>

                <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    {(!user || user.role === 'Traveler') && (
                        <>
                            <li className="nav-separator-item">
                                <NavLink to="/" className="nav-link-premium" onClick={closeMenu}>
                                    <Home size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Home</span>
                                        <span className="nav-subtitle">Explore</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/destinations" className="nav-link-premium" onClick={closeMenu}>
                                    <Map size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Packages</span>
                                        <span className="nav-subtitle">Holiday Deals</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/travel-offers" className="nav-link-premium" onClick={closeMenu}>
                                    <Tag size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Offers</span>
                                        <span className="nav-subtitle">Best Prices</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/hotels" className="nav-link-premium" onClick={closeMenu}>
                                    <Hotel size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Hotels</span>
                                        <span className="nav-subtitle">Premium Stays</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/taxis" className="nav-link-premium" onClick={closeMenu}>
                                    <Car size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Taxis</span>
                                        <span className="nav-subtitle">Airport Cabs</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/packing-assistant" className="nav-link-premium" onClick={closeMenu}>
                                    <Briefcase size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Packing AI</span>
                                        <span className="nav-subtitle">Smart Helper</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="nav-separator-item">
                                <NavLink to="/group-trips" className="nav-link-premium" onClick={closeMenu}>
                                    <Users size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">Group Trips</span>
                                        <span className="nav-subtitle">Travel Together</span>
                                    </div>
                                </NavLink>
                            </li>
                        </>
                    )}


                    {user && (
                        <>
                            <li className="nav-item-mobile">
                                <NavLink to="/profile" className="nav-link-premium" onClick={closeMenu}>
                                    <User size={28} className="nav-icon-premium" />
                                    <div className="nav-text-group">
                                        <span className="nav-title">My Profile</span>
                                        <span className="nav-subtitle">Manage Account</span>
                                    </div>
                                </NavLink>
                            </li>
                            {user.role === 'Traveler' && (
                                <>
                                    <li className="nav-item-mobile">
                                        <NavLink to="/my-bookings" className="nav-link-premium" onClick={closeMenu}>
                                            <Package size={28} className="nav-icon-premium" />
                                            <div className="nav-text-group">
                                                <span className="nav-title">My Bookings</span>
                                                <span className="nav-subtitle">View Trips</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item-mobile">
                                        <NavLink to="/group-trips" className="nav-link-premium" onClick={closeMenu}>
                                            <Users size={28} className="nav-icon-premium" />
                                            <div className="nav-text-group">
                                                <span className="nav-title">Group Trips</span>
                                                <span className="nav-subtitle">Travel Together</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item-mobile">
                                        <NavLink to="/travel-vault" className="nav-link-premium" onClick={closeMenu}>
                                            <Lock size={28} className="nav-icon-premium" />
                                            <div className="nav-text-group">
                                                <span className="nav-title">Travel Vault</span>
                                                <span className="nav-subtitle">Legacy Memories</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item-mobile">
                                        <button className="nav-link-premium" onClick={() => {
                                            closeMenu();
                                            window.dispatchEvent(new CustomEvent('open-agent-chat'));
                                        }} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: '5px 10px' }}>
                                            <MessageSquare size={28} className="nav-icon-premium" />
                                            <div className="nav-text-group">
                                                <span className="nav-title">Chat with Agent</span>
                                                <span className="nav-subtitle">Direct Support</span>
                                            </div>
                                        </button>
                                    </li>
                                </>
                            )}
                            <li className="nav-item-mobile">
                                <button className="nav-link" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', padding: '8px 22px' }}>
                                    <div className="nav-link-content">
                                        <LogOut size={18} color="#fca5a5" />
                                        <span style={{ color: '#fca5a5' }}>Logout</span>
                                    </div>
                                </button>
                            </li>
                        </>
                    )}


                    <li>
                        {user && (
                            <div className="profile-menu-container" ref={profileMenuRef}>
                                <button className="btn-icon" onClick={toggleProfileMenu}>
                                    <Menu size={28} color="var(--text-light)" />
                                </button>

                                {showProfileMenu && (
                                    <div className="profile-dropdown-simple">
                                        <div className="profile-header-simple">
                                            <p className="user-name-simple">{user.name}</p>
                                            <p className="user-role-badge-small">{user.role}</p>
                                        </div>
                                        <div className="divider-simple"></div>

                                        <Link to="/profile" className="menu-item-drop" onClick={() => setShowProfileMenu(false)}>
                                            <User size={16} /> My Profile
                                        </Link>

                                        {user.role === 'Traveler' && (
                                            <>
                                                <Link to="/my-bookings" className="menu-item-drop" onClick={() => setShowProfileMenu(false)}>
                                                    <Package size={16} /> My Booking
                                                </Link>
                                                <Link to="/group-trips" className="menu-item-drop" onClick={() => setShowProfileMenu(false)}>
                                                    <Users size={16} /> Group Trips
                                                </Link>
                                                <Link to="/travel-vault" className="menu-item-drop" onClick={() => setShowProfileMenu(false)}>
                                                    <Lock size={16} /> Travel Vault
                                                </Link>
                                                <button className="menu-item-drop" onClick={() => {
                                                    setShowProfileMenu(false);
                                                    window.dispatchEvent(new CustomEvent('open-agent-chat'));
                                                }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                                    <MessageSquare size={16} /> Chat with Agent
                                                </button>
                                            </>
                                        )}

                                        {user.role === 'Admin' && (
                                            <Link to="/admin" className="menu-item-drop dashboard" onClick={() => setShowProfileMenu(false)}>
                                                <Settings size={16} /> Admin Dashboard
                                            </Link>
                                        )}
                                        {user.role === 'Agent' && (
                                            <Link to="/agent" className="menu-item-drop dashboard" onClick={() => setShowProfileMenu(false)}>
                                                <Settings size={16} /> Agent Dashboard
                                            </Link>
                                        )}

                                        <div className="divider-simple"></div>

                                        <button className="logout-btn-simple" onClick={handleLogout}>
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
