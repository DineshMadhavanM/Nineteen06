import React, { useState, useEffect } from 'react';
import './Navbar.css';

interface User {
    email: string;
    username?: string;
    phone?: string;
    city?: string;
    isAdmin?: boolean;
    loyaltyCakes?: boolean[];
}

interface NavbarProps {
    cartCount: number;
    onCartClick: () => void;
    onLoginClick: () => void;
    onProfileClick: () => void;
    onAdminClick: () => void;
    user: User | null;
    onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick, onLoginClick, onProfileClick, onAdminClick, user, onLogout }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                <div className="logo">
                    <span className="logo-text">NINETEEN 06</span>
                    <span className="logo-subtext">Homemade Desserts</span>
                </div>

                <ul className="nav-links">
                    <li><a href="#hero">Home</a></li>
                    <li><a href="#menu">Menu</a></li>
                    <li><a href="#why-us">About</a></li>
                    <li><a href="#reviews">Reviews</a></li>
                    {user?.isAdmin && <li><a href="#" onClick={(e) => { e.preventDefault(); onAdminClick(); }} className="admin-link">Admin</a></li>}
                </ul>

                <div className="nav-actions">
                    {user ? (
                        <div className="user-profile" onClick={onProfileClick} style={{ cursor: 'pointer' }}>
                            <span className="user-email">{user.username || user.email.split('@')[0]}</span>
                            <button className="btn-logout" onClick={(e) => {
                                e.stopPropagation();
                                onLogout();
                            }}>Logout</button>
                        </div>
                    ) : (
                        <button className="btn-login-trigger" onClick={onLoginClick}>Login / Signup</button>
                    )}

                    <button className="btn-cart" onClick={onCartClick}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span className="cart-count">{cartCount}</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
