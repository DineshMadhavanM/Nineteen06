import React from 'react';
import './InstagramGallery.css';

const InstagramGallery: React.FC = () => {
    return (
        <section id="gallery" className="instagram-gallery section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Follow us @nineteen06.in</span>
                    <h2 className="title">Visit Our Instagram</h2>
                    <div className="divider"><span>📸</span></div>
                </div>

                <div className="insta-footer" style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <a href="https://instagram.com/nineteen06.in" target="_blank" rel="noreferrer" className="btn-secondary">
                        View on Instagram
                    </a>
                </div>
            </div>
        </section>
    );
};

export default InstagramGallery;
