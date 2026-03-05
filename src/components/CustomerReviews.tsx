import React from 'react';
import './CustomerReviews.css';

const CustomerReviews: React.FC = () => {
    const reviews = [
        {
            id: 1,
            name: 'Sarah M.',
            rating: 5,
            comment: 'The Nutella brownie is out of this world! So fudgy and rich. Best dessert in town.',
            date: 'March 2024'
        },
        {
            id: 2,
            name: 'Arjun R.',
            rating: 5,
            comment: 'Ordered the Rasamalai Tres Leches for a party. Everyone loved the fusion! Super fresh.',
            date: 'February 2024'
        },
        {
            id: 3,
            name: 'Priya K.',
            rating: 4,
            comment: 'Lovely aesthetic and the mojitos are so refreshing. Perfect for a quick treat.',
            date: 'January 2024'
        }
    ];

    return (
        <section id="reviews" className="customer-reviews section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Kind Words From Our Guests</span>
                    <h2 className="title">Reviews & Testimonials</h2>
                    <div className="divider"><span>⭐</span></div>
                </div>

                <div className="reviews-grid">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-rating">
                                {[...Array(review.rating)].map((_, i) => (
                                    <span key={i}>⭐</span>
                                ))}
                            </div>
                            <p className="review-comment">"{review.comment}"</p>
                            <div className="review-footer">
                                <span className="review-name">{review.name}</span>
                                <span className="review-date">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CustomerReviews;
