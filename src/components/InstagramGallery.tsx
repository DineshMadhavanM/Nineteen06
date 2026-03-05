import React from 'react';
import './InstagramGallery.css';

const InstagramGallery: React.FC = () => {
    // Mock Instagram images
    const images = [
        { id: 1, icon: '🍫', label: 'Brownies' },
        { id: 2, icon: '🍰', label: 'Cakes' },
        { id: 3, icon: '🍸', label: 'Mojitos' },
        { id: 4, icon: '🧁', label: 'Jar Cakes' },
        { id: 5, icon: '🍪', label: 'Cookies' },
        { id: 6, icon: '☕', label: 'Cafe' },
    ];

    return (
        <section id="gallery" className="instagram-gallery section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Follow us @nineteen06.in</span>
                    <h2 className="title">Instagram Gallery</h2>
                    <div className="divider"><span>📸</span></div>
                </div>

                <div className="instagram-grid">
                    {images.map((img) => (
                        <div key={img.id} className="instagram-item">
                            <div className="instagram-overlay">
                                <span className="insta-icon">📸</span>
                                <span className="insta-label">{img.label}</span>
                            </div>
                            <div className="insta-placeholder">
                                <span className="placeholder-icon">{img.icon}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="insta-footer">
                    <a href="https://instagram.com/nineteen06.in" target="_blank" rel="noreferrer" className="btn-secondary">
                        View on Instagram
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InstagramGallery;
