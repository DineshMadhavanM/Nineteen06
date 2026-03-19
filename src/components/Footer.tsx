import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-brand">
                    <div className="logo">
                        <span className="logo-text">NINETEEN 06</span>
                        <span className="logo-subtext">Homemade Desserts</span>
                    </div>
                    <p className="footer-desc">
                        Luxury homemade dessert café aesthetic. Freshly made with love and premium ingredients.
                    </p>
                </div>

                <div className="footer-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="#hero">Home</a></li>
                        <li><a href="#menu">Menu</a></li>
                        <li><a href="#why-us">Why Choose Us</a></li>
                        <li><a href="#reviews">Testimonials</a></li>
                    </ul>
                </div>

                <div className="footer-contact">
                    <h3>Contact Us</h3>
                    <ul>
                        <li>
                            <span>Instagram:</span>
                            <a href="https://instagram.com/nineteen06.in" target="_blank" rel="noreferrer">nineteen06.in</a>
                        </li>
                        <li>
                            <span>Phone:</span>
                            <a href="tel:9150429327">9150429327</a>
                        </li>
                        <li>
                            <span>Email:</span>
                            <a href="mailto:nineteen06.in@gmail.com">nineteen06.in@gmail.com</a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} NINETEEN 06. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
