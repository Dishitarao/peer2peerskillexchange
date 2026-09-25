import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import { reviewAPI } from '../services';
import StarRating from '../components/common/StarRating';
import { Star, MessageSquare } from 'lucide-react';

const ReviewsPage = () => {
  const { user } = useSelector(selectAuth);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await reviewAPI.getReviewsForUser(user.id);
        setReviews(res.data.data.reviews || []);
        setStats({
          average: res.data.data.averageRating || 0,
          count: res.data.data.ratingCount || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserReviews();
  }, [user]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews & Feedback</h1>
          <p className="page-subtitle">
            Ratings and reviews submitted by peers after completed learning sessions
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
            {stats.average > 0 ? stats.average.toFixed(1) : '—'}
          </div>
          <StarRating rating={stats.average} size={16} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Overall Mentor Rating</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Based on {stats.count} student feedback review{stats.count === 1 ? '' : 's'}.
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map((rev) => (
            <div key={rev._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={
                      rev.reviewerId?.profilePicture ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${rev.reviewerId?.firstName || 'User'}`
                    }
                    alt={rev.reviewerId?.firstName}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {rev.reviewerId?.firstName} {rev.reviewerId?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(rev.createdAt).toLocaleDateString()} • {rev.skillId?.title || 'Session'}
                    </div>
                  </div>
                </div>
                <StarRating rating={rev.rating} size={15} />
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                "{rev.reviewText}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <MessageSquare size={40} className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h4>No Reviews Received Yet</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Complete mentoring sessions with students to receive feedback and build your tutor reputation!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
