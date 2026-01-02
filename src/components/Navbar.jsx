import { useState, useEffect, useContext, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, User, Settings, Lock } from 'lucide-react';
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
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/destinations" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Destinations
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/packages" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMenu}>
                            Packages & Deals
                        </NavLink>
                    </li>
                    <li>
                        <Link to="/contact" className="btn btn-primary" onClick={closeMenu}>
                            Book Now
                        </Link>
                    </li>
                    <li>
                        {user && (
                            <div className="profile-menu-container" ref={profileMenuRef}>
                                <button className="btn-icon" onClick={toggleProfileMenu}>
                                    <User size={28} color="var(--text-light)" />
                                </button>

                                {showProfileMenu && (
                                    <div className="profile-dropdown-simple">
                                        <div className="profile-header-simple">
                                            <p className="user-name-simple">{user.name}</p>
                                            <p className="user-email-simple">{user.email}</p>
                                        </div>
                                        <div className="divider-simple"></div>
                                        {user.role === 'Admin' && (
                                            <>
                                                <Link to="/admin" className="logout-btn-simple" onClick={closeMenu} style={{ background: 'rgba(var(--secondary-rgb), 0.1)', color: 'var(--secondary)', marginBottom: '8px' }}>
                                                    Admin Dashboard
                                                </Link>
                                                <div className="divider-simple"></div>
                                            </>
                                        )}
                                        {user.role === 'Agent' && (
                                            <>
                                                <Link to="/agent" className="logout-btn-simple" onClick={closeMenu} style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', marginBottom: '8px' }}>
                                                    Agent Dashboard
                                                </Link>
                                                <div className="divider-simple"></div>
                                            </>
                                        )}
                                        <button className="logout-btn-simple" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Lock size={16} />
                                            Logout
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
