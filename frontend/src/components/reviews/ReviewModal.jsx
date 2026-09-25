import React, { useState } from 'react';
import { X, Star, AlertCircle } from 'lucide-react';
import StarRating from '../common/StarRating';

const ReviewModal = ({ isOpen, onClose, session, onSubmit }) => {
  if (!isOpen || !session) return null;

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      setError('Please write a brief review description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit({
        sessionId: session._id,
        rating,
        reviewText
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Leave a Review</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              For session: {session.skillId?.title || 'Skill Session'}
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Star Rating Picker */}
            <div className="form-group" style={{ alignItems: 'center', textAlign: 'center', margin: '1rem 0' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Your Rating: {rating} Star{rating > 1 ? 's' : ''}
              </label>
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={(r) => setRating(r)}
                size={28}
              />
            </div>

            {/* Review description */}
            <div className="form-group">
              <label className="form-label">Written Feedback</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience... What went well? How helpful was your peer?"
                className="form-textarea"
                rows={4}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
