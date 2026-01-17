import { useState, useEffect, useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, LogOut, Tag, Hotel, Car, Home, Map, Briefcase, Package } from 'lucide-react';
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
                    <li>
                        <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Home size={18} />
                                <span>Home</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/destinations" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Map size={18} />
                                <span>Packages</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/travel-offers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Tag size={18} />
                                <span>Travel Offers</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/hotels" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Hotel size={18} />
                                <span>Hotels</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/taxis" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Car size={18} />
                                <span>Taxis</span>
                            </div>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/packing-assistant" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            <div className="nav-link-content">
                                <Briefcase size={18} />
                                <span>Packing AI</span>
                            </div>
                        </NavLink>
                    </li>

                    {user && (
                        <>
                            <li className="nav-item-mobile">
                                <NavLink to="/profile" className="nav-link" onClick={closeMenu}>
                                    <div className="nav-link-content">
                                        <User size={18} />
                                        <span>My Profile</span>
                                    </div>
                                </NavLink>
                            </li>
                            {user.role === 'Traveler' && (
                                <li className="nav-item-mobile">
                                    <NavLink to="/my-bookings" className="nav-link" onClick={closeMenu}>
                                        <div className="nav-link-content">
                                            <Package size={18} />
                                            <span>My Booking</span>
                                        </div>
                                    </NavLink>
                                </li>
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
                                            <Link to="/my-bookings" className="menu-item-drop" onClick={() => setShowProfileMenu(false)}>
                                                <Package size={16} /> My Booking
                                            </Link>
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
