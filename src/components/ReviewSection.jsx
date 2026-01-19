import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, Send, User, Trash2, Edit2, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import './ReviewSection.css';

const ReviewSection = ({ itemId, itemType }) => {
    const { user } = useContext(AuthContext);
    const [reviews, setReviews] = useState([]);

    // Form State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');
    const [expandedImage, setExpandedImage] = useState(null);

    // Editing State
    const [editingReviewId, setEditingReviewId] = useState(null);

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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = (review) => {
        setEditingReviewId(review.id);
        setRating(review.rating);
        setComment(review.review || review.comment);
        setImage(review.image_url || '');
        // Scroll to form
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setRating(5);
        setComment('');
        setImage('');
    };

    const handleDelete = async (reviewId) => {
        if (!confirm("Delete this review?")) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`/api/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchReviews();
        } catch (err) {
            console.error(err);
            alert('Failed to delete review');
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
            if (editingReviewId) {
                // Update existing review
                await axios.put(`/api/reviews/${editingReviewId}`, {
                    rating,
                    comment,
                    image_url: image
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create new review
                await axios.post('/api/reviews', {
                    itemId,
                    itemType,
                    rating,
                    comment,
                    image_url: image
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            handleCancelEdit(); // Reset form
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

            <form id="review-form" className="review-form" onSubmit={handleSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>
                        {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                    </h4>
                    {editingReviewId && (
                        <button type="button" onClick={handleCancelEdit} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Cancel Edit</button>
                    )}
                </div>

                <div className="rating-input">
                    <label>Your Rating</label>
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={24}
                                fill={s <= rating ? '#fbbf24' : 'none'}
                                color={s <= rating ? '#fbbf24' : 'rgba(255,255,255,0.3)'}
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
                        rows={3}
                    />

                    <div className="review-actions-bar" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <div className="image-attachment">
                            <input
                                type="file"
                                id="review-image-upload"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                            <label htmlFor="review-image-upload" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: image ? '#4ade80' : '#94a3b8' }}>
                                <ImageIcon size={18} /> {image ? 'Image Attached' : 'Add Photo'}
                            </label>
                            {image && (
                                <div style={{ position: 'relative', display: 'inline-block', marginLeft: '10px', verticalAlign: 'middle' }}>
                                    <img src={image} alt="Preview" style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setImage(''); }}
                                        style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', border: 'none', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '10px' }}
                                    >✕</button>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '8px 20px' }}>
                            {isSubmitting ? 'Posting...' : <><Send size={16} style={{ marginRight: '5px' }} /> {editingReviewId ? 'Update' : 'Post'}</>}
                        </button>
                    </div>
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
                                <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="review-user">
                                        <div className="user-avatar">
                                            {rev.profile_picture ? (
                                                <img src={rev.profile_picture} alt={rev.user_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <User size={20} />
                                            )}
                                        </div>
                                        <div className="user-info">
                                            <strong>{rev.user_name}</strong>
                                            <div className="review-meta" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <div className="review-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={12} fill={i < rev.rating ? '#fbbf24' : 'none'} color="#fbbf24" />
                                                    ))}
                                                </div>
                                                <span className="review-date">{new Date(rev.review_date || rev.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons for Owner */}
                                    {user && user.id === rev.user_id && (
                                        <div className="review-owner-actions" style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => handleEditClick(rev)} title="Edit" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(rev.id)} title="Delete" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                </div>

                                <p className="review-comment">{rev.review}</p>

                                {rev.image_url && (
                                    <div className="review-image" onClick={() => setExpandedImage(rev.image_url)} style={{ marginTop: '10px', cursor: 'pointer', width: 'fit-content' }}>
                                        <img src={rev.image_url} alt="Review attachment" style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <p className="no-reviews">No reviews yet. Be the first to share your journey!</p>
                )}
            </div>

            {/* Image Modal */}
            {expandedImage && (
                <div className="image-modal-overlay" onClick={() => setExpandedImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                        <button onClick={() => setExpandedImage(null)} style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={32} /></button>
                        <img src={expandedImage} alt="Full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '4px' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
