import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs: React.FC = () => {
    const features = [
        {
            icon: '🏠',
            title: 'Homemade Recipes',
            desc: 'Our desserts are made using traditional family recipes passed down through generations.'
        },
        {
            icon: '🌿',
            title: 'Fresh Ingredients',
            desc: 'We use only the finest, locally sourced premium ingredients for authentic taste.'
        },
        {
            icon: '⏰',
            title: 'Prepared Fresh',
            desc: 'Every single order is prepared fresh from scratch only after you place it.'
        },
        {
            icon: '🎉',
            title: 'Party & Bulk Orders',
            desc: 'We cater for special events, parties, and corporate gatherings with custom packages.'
        }
    ];

    return (
        <section id="why-us" className="why-us section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Real Quality • Real Taste</span>
                    <h2 className="title">Why Choose Us</h2>
                    <div className="divider"><span>🍪</span></div>
                </div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-desc">{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="preparation-alert">
                    <div className="alert-content">
                        <span className="alert-icon">⚡</span>
                        <p><strong>Freshness Guarantee:</strong> Kindly allow 10 minutes for preparation as we craft your dessert with love.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
