import React, { useState, useEffect } from 'react';
import './MobileFAB.css';

interface MobileFABProps {
    onClick: () => void;
}

const MobileFAB: React.FC<MobileFABProps> = ({ onClick }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show FAB after scrolling past hero (approx 300px)
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <button
            className={`mobile-fab ${isVisible ? 'visible' : ''}`}
            onClick={onClick}
            aria-label="Order Now"
        >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                <path d="M3 6h18"></path>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span className="fab-text">Order</span>
        </button>
    );
};

export default MobileFAB;
