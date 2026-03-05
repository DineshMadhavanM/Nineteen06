import React from 'react';
import './Hero.css';
import heroImage from '../assets/images/hero.png';

interface HeroProps {
    onOrderClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOrderClick }) => {
    return (
        <section id="hero" className="hero">
            <div className="container hero-container">
                <div className="hero-content">
                    <div className="hero-brand-top serif">NINETEEN 06</div>
                    <h1 className="hero-main-title">1906</h1>
                    <h2 className="hero-sub-brand serif">HOMEMADE DESSERTS</h2>
                    <p className="hero-subtitle">
                        Freshly made • Made with love
                    </p>
                    <p className="hero-description">
                        Experience the finest artisanal brownies, cakes, and refreshing mojitos, prepared fresh just for you in our cozy vintage café.
                    </p>
                    <div className="hero-btns">
                        <a href="#menu" className="btn-primary" onClick={(e) => { e.preventDefault(); onOrderClick(); }}>Explore Menu</a>
                        <button className="btn-secondary" onClick={onOrderClick}>Order Now</button>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">Fresh Ingredients</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">10m</span>
                            <span className="stat-label">Prep Time</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">4.9/5</span>
                            <span className="stat-label">Customer Rating</span>
                        </div>
                    </div>
                </div>
                <div className="hero-image-container">
                    <div className="hero-image-wrapper">
                        <img src={heroImage} alt="Premium Homemade Desserts" className="hero-img" />
                        <div className="image-accent-1"></div>
                        <div className="image-accent-2"></div>
                        <div className="floating-card">
                            <div className="floating-icon">🍰</div>
                            <div className="floating-text">
                                <strong>Best Seller</strong>
                                <span>Classic Brownie</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="hero-bg-accent"></div>
        </section>
    );
};

export default Hero;
