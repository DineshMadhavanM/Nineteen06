import React, { useState, useEffect } from 'react';
import './CustomerReviews.css';
import { apiUrl } from '../lib/api';

interface Review {
    _id: string;
    name: string;
    rating: number;
    comment: string;
    date: string;
}

interface CustomerReviewsProps {
    isAdmin?: boolean;
}

const CustomerReviews: React.FC<CustomerReviewsProps> = ({ isAdmin }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [medianRating, setMedianRating] = useState(5.0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        console.log("CustomerReviews DEBUG: isAdmin prop state:", isAdmin);
    }, [isAdmin]);
    
    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    const fetchReviewsData = async () => {
        try {
            const res = await fetch(apiUrl('/api/reviews'));
            if (res.ok) {
                const data = await res.json();
                console.log('Fetched Reviews API Data:', data);
                if (data && typeof data === 'object') {
                    setReviews(data.reviews || []);
                    setMedianRating(data.medianRating || 5.0);
                    setTotalCount(data.totalReviews || 0);
                    console.log('State updated - totalCount:', data.totalReviews);
                }
            } else {
                console.error('Failed to fetch reviews - status:', res.status);
            }
        } catch (err) {
            console.error('Failed to fetch reviews', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviewsData();
        
        // Real-time Update: Poll for new reviews every 10 seconds
        const intervalId = setInterval(fetchReviewsData, 10000);
        
        return () => clearInterval(intervalId);
    }, [isAdmin, token]); // Refetch when admin status or token changes (login/logout)

    const handleSubmit = async (e: React.FormEvent) => {
        console.log('--- Submitting Review ---');
        e.preventDefault();
        setError('');
        
        console.log('isLoggedIn:', isLoggedIn, 'Token exists:', !!token);
        if (!isLoggedIn) {
            console.warn('User not logged in, cannot submit.');
            setError('Please login to submit a review');
            return;
        }

        if (!comment.trim()) {
            setError('Please provide a comment');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl('/api/reviews'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token as string
                },
                body: JSON.stringify({ rating, comment })
            });

            console.log('Submission Response Status:', res.status);
            if (res.ok) {
                console.log('Submission successful!');
                setComment('');
                setRating(5);
                setShowForm(false);
                fetchReviewsData(); // Refresh list
            } else {
                const data = await res.json();
                console.error('Submission failed:', data.message);
                setError(data.message || 'Failed to submit review');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="reviews" className="customer-reviews section-padding">
            <div className="container">
                <div className="section-header">
                    <span className="subtitle">Kind Words From Our Guests</span>
                    <h2 className="title">Reviews & Testimonials</h2>
                    <div className="divider"><span>⭐</span></div>
                </div>
                
                <div className="review-actions">
                    {!showForm ? (
                        <button 
                            className="btn btn-primary leave-review-btn" 
                            onClick={() => {
                                if (isLoggedIn) setShowForm(true);
                                else {
                                    // Normally we would open login, but triggering a custom event or letting them know
                                    const loginBtn = document.querySelector('.navbar-actions .btn-primary') as HTMLButtonElement;
                                    if (loginBtn) loginBtn.click();
                                    else alert('Please login to leave a review.');
                                }
                            }}
                        >
                            {isLoggedIn ? 'Leave a Review' : 'Login to Leave a Review'}
                        </button>
                    ) : (
                        <form className="review-form" onSubmit={handleSubmit}>
                            <h3>Write your review</h3>
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star} 
                                            type="button" 
                                            className={star <= rating ? 'active' : ''}
                                            onClick={() => setRating(star)}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Your Comment</label>
                                <textarea 
                                    value={comment} 
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you think of our treats?"
                                    rows={4}
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="average-rating-summary">
                    <div className="rating-score">
                        {medianRating.toFixed(1)}
                    </div>
                    <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= Math.round(medianRating) ? 'active' : ''}>
                                ⭐
                            </span>
                        ))}
                    </div>
                    <div className="rating-subtitle">Median Rating</div>
                    <div className="rating-count">
                        Based on {totalCount} review{totalCount !== 1 ? 's' : ''}
                    </div>
                </div>

                {isAdmin && (
                    <>
                        {loading ? (
                            <div className="loading-reviews">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="no-reviews">No reviews yet. Be the first to leave one!</div>
                        ) : (
                            <div className="reviews-grid">
                                {reviews.map((review) => (
                                    <div key={review._id} className="review-card">
                                        <div className="review-rating">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <span key={i}>⭐</span>
                                            ))}
                                        </div>
                                        <p className="review-comment">"{review.comment}"</p>
                                        <div className="review-footer">
                                            <span className="review-name">{review.name}</span>
                                            <span className="review-date">
                                                {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default CustomerReviews;
