import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userAPI, sessionAPI } from '../services';
import { selectAuth } from '../redux/slices/authSlice';
import SkillCard from '../components/skills/SkillCard';
import SessionRequestModal from '../components/sessions/SessionRequestModal';
import ReportModal from '../components/common/ReportModal';
import StarRating from '../components/common/StarRating';
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  BookOpen,
  Flag,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const MentorProfilePage = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useSelector(selectAuth);

  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [bookingSkill, setBookingSkill] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchMentor = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMentorProfile(mentorId);
      setMentorData(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load mentor profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
  }, [mentorId]);

  const handleBookSkill = (skill) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingSkill(skill);
  };

  const handleBookingSubmit = async (requestData) => {
    await sessionAPI.requestSession(requestData);
    setFeedback({
      type: 'success',
      text: 'Session request sent! Your mentor has been notified.'
    });
    setBookingSkill(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  if (error || !mentorData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={40} style={{ margin: '0 auto 1rem auto', color: 'var(--accent-rose)' }} />
        <h3>Mentor Profile Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{error || 'This user does not exist or has deactivated their profile.'}</p>
        <button type="button" onClick={() => navigate('/mentors')} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Mentors
        </button>
      </div>
    );
  }

  const { mentor, skills, reviews } = mentorData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ width: 'fit-content', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {feedback && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Mentor Header Profile Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={
              mentor.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.firstName || 'User'}`
            }
            alt={mentor.firstName}
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--border-color)'
            }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {mentor.firstName} {mentor.lastName}
                </h1>
                {mentor.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <MapPin size={15} /> {mentor.location}
                  </div>
                )}
              </div>

              {currentUser?.id !== mentor._id && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setReportModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-rose)' }}
                >
                  <Flag size={14} /> Report
                </button>
              )}
            </div>

            {/* Rating summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
              <StarRating rating={mentor.rating?.average || 0} size={18} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                ({reviews?.length || 0} student reviews)
              </span>
            </div>

            {/* Bio */}
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '1rem', lineHeight: 1.6 }}>
              {mentor.bio || 'Passionate peer educator.'}
            </p>

            {/* Interests */}
            {mentor.interests && mentor.interests.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1rem' }}>
                {mentor.interests.map((interest, i) => (
                  <span key={i} className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Availability Schedule */}
        {mentor.availability && mentor.availability.length > 0 && (
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary)" /> Availability Slots
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {mentor.availability.map((slot, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <strong>{slot.day}:</strong> {slot.startTime} - {slot.endTime}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills Offered by this Mentor */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          Skills Taught by {mentor.firstName} ({skills.length})
        </h2>

        {skills.length > 0 ? (
          <div className="grid-cols-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={{ ...skill, userId: mentor }}
                isOwner={currentUser?.id === mentor._id}
                onRequestSession={handleBookSkill}
              />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <p>This mentor currently has no active teaching skills.</p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
          Student Reviews & Feedback ({reviews.length})
        </h2>

        {reviews.length > 0 ? (
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
                        {new Date(rev.createdAt).toLocaleDateString()}
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
            <p>No reviews yet. Be the first to book a session and leave a review!</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <SessionRequestModal
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
        skill={bookingSkill}
        onSubmit={handleBookingSubmit}
        userBalance={currentUser?.walletBalance ?? 100}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetItem={{ userId: mentor._id }}
        reportTypeDefault="INAPPROPRIATE_USER"
      />
    </div>
  );
};

export default MentorProfilePage;
