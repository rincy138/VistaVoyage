import { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ReviewSection.css';

const ReviewSection = ({ itemId, itemType }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [itemId, itemType]);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`/api/reviews/${itemType}/${itemId}`);
            setReviews(res.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to leave a review');
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.post('/api/reviews', {
                itemId,
                itemType,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err) {
            console.error('Error posting review:', err);
            alert(err.response?.data?.message || 'Failed to post review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-section glass-card">
            <h3>Reviews & Ratings</h3>

            <form className="review-form" onSubmit={handleSubmit}>
                <div className="rating-input">
                    <label>Your Rating</label>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={24}
                                fill={s <= rating ? 'var(--primary)' : 'none'}
                                color={s <= rating ? 'var(--primary)' : 'rgba(255,255,255,0.3)'}
                                onClick={() => setRating(s)}
                                style={{ cursor: 'pointer' }}
                            />
                        ))}
                    </div>
                </div>
                <div className="comment-input">
                    <textarea
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Posting...' : <><Send size={18} /> Post Review</>}
                    </button>
                </div>
            </form>

            <div className="reviews-list">
                {isLoading ? (
                    <p>Loading reviews...</p>
                ) : reviews.length > 0 ? (
                    <AnimatePresence>
                        {reviews.map((rev, idx) => (
                            <motion.div
                                key={rev.id || idx}
                                className="review-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="review-user">
                                    <div className="user-avatar">
                                        <User size={20} />
                                    </div>
                                    <div className="user-info">
                                        <strong>{rev.user_name}</strong>
                                        <div className="review-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill={i < rev.rating ? 'var(--primary)' : 'none'} color="var(--primary)" />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="review-date">{new Date(rev.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="review-comment">{rev.comment}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <p className="no-reviews">No reviews yet. Be the first to share your journey!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
