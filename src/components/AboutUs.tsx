import React from 'react';
import './AboutUs.css';

const AboutUs: React.FC = () => {
    return (
        <section id="about" className="about-us section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Our Story • Our Passion</span>
                    <h2 className="title">About Us</h2>
                    <div className="divider"><span>🏠</span></div>
                </div>

                <div className="about-content">
                    <div className="about-main-text">
                        <p className="lead-text">
                            Welcome to <strong>NINETEEN 06 – Homemade Desserts</strong>.
                        </p>
                        <p>
                            We specialize in freshly prepared brownies, cakes, jar desserts, mojitos, and delicious snacks made with love and quality ingredients. Every item is prepared fresh upon order to ensure the best taste and quality for our customers.
                        </p>
                        <p>
                            Our mission is to bring a premium homemade dessert experience where every bite feels special. From rich chocolate brownies to refreshing mojitos, we focus on taste, freshness, and presentation.
                        </p>
                    </div>

                    <div className="team-grid">
                        <div className="team-card founder">
                            <div className="card-glass">
                                <div className="profile-img-placeholder">V</div>
                                <div className="member-info">
                                    <h3>Vishagan</h3>
                                    <span className="member-role">Founder & Owner</span>
                                    <p>Founder of NINETEEN 06 Homemade Bakes. Passionate about creating delicious homemade desserts and bringing unique sweet experiences to customers.</p>
                                </div>
                            </div>
                        </div>

                        <div className="team-card developer">
                            <div className="card-glass">
                                <div className="profile-img-placeholder">D</div>
                                <div className="member-info">
                                    <h3>Dinesh Madhavan</h3>
                                    <span className="member-role">Website Developer</span>
                                    <p className="member-subtext">Artificial Intelligence and Data Science Student</p>
                                    <p>Full Stack Developer who designed and developed the website platform for NINETEEN 06 to provide a modern online ordering experience.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="thank-you-note">
                        <p>We thank all our customers for supporting our homemade dessert journey.</p>
                        <div className="signature">With Love, The 1906 Team</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;
