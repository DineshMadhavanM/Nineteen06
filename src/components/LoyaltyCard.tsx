import React from 'react';
import './LoyaltyCard.css';

interface LoyaltyCardProps {
    username?: string;
    email: string;
    loyaltyCakes?: boolean[];
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({ username, email, loyaltyCakes }) => {
    const cakes = loyaltyCakes || [false, false, false, false, false, false, false, false, false];

    return (
        <div className="loyalty-card-section">
            <div className="loyalty-card">
                <div className="loyalty-header">
                    <h3 className="loyalty-title">Loyalty Card</h3>
                    <p className="loyalty-offer">Buy 9, Get 1 Dessert FREE!</p>
                </div>

                <div className="loyalty-user-info">
                    <span className="loyalty-label">Name:-</span>
                    <span className="loyalty-name">{username || email.split('@')[0]}</span>
                </div>

                <div className="loyalty-grid">
                    {cakes.map((isMarked, index) => (
                        <div key={index} className={`loyalty-slot ${isMarked ? 'active' : ''}`}>
                            <span className="cake-slice">🍰</span>
                            {index === 4 && <span className="slot-label">25% off</span>}
                            {index === 8 && <span className="slot-label free">FREE</span>}
                        </div>
                    ))}
                </div>
                <div className="loyalty-disclaimer">
                    * 1st purchase above ₹100 required
                </div>
            </div>
        </div>
    );
};
