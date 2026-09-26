import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import { fetchWallet, selectWallet } from '../redux/slices/walletSlice';
import { fetchUpcomingSessions, fetchIncomingRequests, fetchOutgoingRequests, selectSessions } from '../redux/slices/sessionSlice';
import { fetchMySkills, selectSkills } from '../redux/slices/skillSlice';

import { sessionAPI } from '../services';
import SessionCard from '../components/sessions/SessionCard';
import SessionActionModal from '../components/sessions/SessionActionModal';
import ReviewModal from '../components/sessions/../reviews/ReviewModal';
import ReportModal from '../components/common/ReportModal';
import {
  CreditCard,
  Calendar,
  Clock,
  BookOpen,
  PlusCircle,
  Search,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Users,
  GraduationCap
} from 'lucide-react';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const { wallet } = useSelector(selectWallet);
  const { upcomingSessions, incomingRequests, outgoingRequests } = useSelector(selectSessions);
  const { mySkills } = useSelector(selectSkills);

  // Modals state
  const [actionModal, setActionModal] = useState({ isOpen: false, session: null, type: '' });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, session: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, session: null });
  const [statusMessage, setStatusMessage] = useState(null);

  const loadDashboardData = () => {
    dispatch(fetchWallet());
    dispatch(fetchUpcomingSessions());
    dispatch(fetchIncomingRequests());
    dispatch(fetchOutgoingRequests());
    dispatch(fetchMySkills());
  };

  useEffect(() => {
    loadDashboardData();
  }, [dispatch]);

  // Session Handlers
  const handleAccept = async (sessionId) => {
    try {
      await sessionAPI.acceptSession(sessionId);
      setStatusMessage({ type: 'success', text: 'Session accepted successfully!' });
      loadDashboardData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to accept session.' });
    }
  };

  const handleConfirmCompletion = async (sessionId) => {
    try {
      const res = await sessionAPI.confirmCompletion(sessionId);
      setStatusMessage({ type: 'success', text: res.data.message });
      loadDashboardData();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to confirm completion.' });
    }
  };

  const handleActionSubmit = async (payload) => {
    const { session, type } = actionModal;
    if (type === 'REJECT') {
      await sessionAPI.rejectSession(session._id, payload);
    } else if (type === 'CANCEL') {
      await sessionAPI.cancelSession(session._id, payload);
    } else if (type === 'RESCHEDULE') {
      await sessionAPI.rescheduleSession(session._id, payload);
    }
    loadDashboardData();
  };

  const handleReviewSubmit = async (reviewData) => {
    await sessionAPI.submitReview(reviewData);
    setStatusMessage({ type: 'success', text: 'Review posted! Thank you.' });
    loadDashboardData();
  };

  const currentBalance = wallet?.currentBalance ?? user?.walletBalance ?? 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Welcome & Summary Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-hover) 100%)',
          padding: '1.75rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
            <Sparkles size={16} /> Welcome back
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Ready to teach or learn something new today?
          </p>
        </div>

        {/* Credit Card & Quick Stats */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              padding: '1rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Credit Balance
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                {currentBalance} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>credits</span>
              </div>
            </div>
            <Link to="/wallet" className="btn btn-secondary btn-sm" style={{ marginLeft: '0.5rem' }}>
              History
            </Link>
          </div>
        </div>
      </div>

      {/* Status message notification */}
      {statusMessage && (
        <div className={`alert ${statusMessage.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Quick Action Navigation Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link to="/skills" className="btn btn-primary">
          <Search size={16} /> Find a Mentor
        </Link>
        <Link to="/skills/add" className="btn btn-secondary">
          <PlusCircle size={16} /> Add Teaching Skill
        </Link>
        <Link to="/sessions" className="btn btn-secondary">
          <Calendar size={16} /> View All Sessions
        </Link>
        <Link to="/profile/edit" className="btn btn-secondary">
          <Clock size={16} /> Set Availability
        </Link>
      </div>

      {/* Main Grid: Upcoming Sessions & Incoming Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Left Column: Upcoming Sessions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--primary)" /> Upcoming Sessions
            </h2>
            <Link to="/sessions" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              View All ({upcomingSessions.length})
            </Link>
          </div>

          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  currentUserId={user?.id}
                  onAccept={handleAccept}
                  onReject={(s) => setActionModal({ isOpen: true, session: s, type: 'REJECT' })}
                  onCancel={(s) => setActionModal({ isOpen: true, session: s, type: 'CANCEL' })}
                  onReschedule={(s) => setActionModal({ isOpen: true, session: s, type: 'RESCHEDULE' })}
                  onConfirmCompletion={handleConfirmCompletion}
                  onReview={(s) => setReviewModal({ isOpen: true, session: s })}
                  onReport={(s) => setReportModal({ isOpen: true, session: s })}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
              <Calendar size={36} style={{ margin: '0 auto 0.75rem auto', color: 'var(--text-muted)' }} />
              <h4 style={{ fontWeight: 600 }}>No Upcoming Sessions Scheduled</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', marginBottom: '1rem' }}>
                Search for a skill and book a mentor to start learning.
              </p>
              <Link to="/skills" className="btn btn-primary btn-sm">
                Explore Mentors
              </Link>
            </div>
          )}

          {/* Pending Incoming Requests (If Mentor) */}
          {incomingRequests && incomingRequests.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '0.75rem' }}>
                Incoming Requests Awaiting Your Approval ({incomingRequests.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {incomingRequests.map((session) => (
                  <SessionCard
                    key={session._id}
                    session={session}
                    currentUserId={user?.id}
                    onAccept={handleAccept}
                    onReject={(s) => setActionModal({ isOpen: true, session: s, type: 'REJECT' })}
                    onCancel={(s) => setActionModal({ isOpen: true, session: s, type: 'CANCEL' })}
                    onReschedule={(s) => setActionModal({ isOpen: true, session: s, type: 'RESCHEDULE' })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Your Skills & Interests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Skills You Teach */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="var(--primary)" /> Skills You Teach
              </h3>
              <Link to="/skills/add" className="btn btn-secondary btn-sm">
                <PlusCircle size={14} /> Add Skill
              </Link>
            </div>

            {mySkills && mySkills.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mySkills.map((sk) => (
                  <div
                    key={sk._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-hover)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sk.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {sk.category} • {sk.level}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                        {sk.creditsPerHour} credits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                You haven't listed any skills yet. Share your expertise to earn credits!
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to="/skills/add" className="btn btn-primary btn-sm">
                    List a Skill
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Skills You Want to Learn */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} color="var(--accent-blue)" /> Skills You Want to Learn
              </h3>
              <Link to="/profile/edit" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                Edit
              </Link>
            </div>

            {user?.skillsToLearn && user.skillsToLearn.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {user.skillsToLearn.map((skillName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(`/skills?search=${encodeURIComponent(skillName)}`)}
                    className="btn btn-secondary btn-sm"
                    style={{ borderRadius: 'var(--radius-full)' }}
                  >
                    <Search size={12} /> {skillName}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Add target learning skills to your profile to receive personalized mentor recommendations.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Modals */}
      <SessionActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, session: null, type: '' })}
        session={actionModal.session}
        actionType={actionModal.type}
        onSubmit={handleActionSubmit}
      />

      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false, session: null })}
        session={reviewModal.session}
        onSubmit={handleReviewSubmit}
      />

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, session: null })}
        targetItem={reportModal.session}
      />
    </div>
  );
};

export default DashboardPage;
