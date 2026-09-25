import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySessions, selectSessions } from '../redux/slices/sessionSlice';
import { selectAuth } from '../redux/slices/authSlice';
import { sessionAPI, reviewAPI } from '../services';
import SessionCard from '../components/sessions/SessionCard';
import SessionActionModal from '../components/sessions/SessionActionModal';
import ReviewModal from '../components/reviews/ReviewModal';
import ReportModal from '../components/common/ReportModal';
import { Calendar, Filter, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const MySessionsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const { sessionsList, total, page, totalPages, loading } = useSelector(selectSessions);

  const [activeTab, setActiveTab] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [actionModal, setActionModal] = useState({ isOpen: false, session: null, type: '' });
  const [reviewModal, setReviewModal] = useState({ isOpen: false, session: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, session: null });
  const [feedback, setFeedback] = useState(null);

  const loadSessions = () => {
    dispatch(
      fetchMySessions({
        status: activeTab,
        role: roleFilter,
        page: currentPage,
        limit: 10
      })
    );
  };

  useEffect(() => {
    loadSessions();
  }, [dispatch, activeTab, roleFilter, currentPage]);

  const handleAccept = async (sessionId) => {
    try {
      await sessionAPI.acceptSession(sessionId);
      setFeedback({ type: 'success', text: 'Session request accepted.' });
      loadSessions();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to accept session.' });
    }
  };

  const handleConfirmCompletion = async (sessionId) => {
    try {
      const res = await sessionAPI.confirmCompletion(sessionId);
      setFeedback({ type: 'success', text: res.data.message });
      loadSessions();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to confirm completion.' });
    }
  };

  const handleActionSubmit = async (payload) => {
    const { session, type } = actionModal;
    if (type === 'REJECT') {
      await sessionAPI.rejectSession(session._id, payload);
      setFeedback({ type: 'success', text: 'Session request declined.' });
    } else if (type === 'CANCEL') {
      await sessionAPI.cancelSession(session._id, payload);
      setFeedback({ type: 'success', text: 'Session cancelled.' });
    } else if (type === 'RESCHEDULE') {
      await sessionAPI.rescheduleSession(session._id, payload);
      setFeedback({ type: 'success', text: 'Session reschedule proposal sent.' });
    }
    loadSessions();
  };

  const handleReviewSubmit = async (reviewData) => {
    await reviewAPI.submitReview(reviewData);
    setFeedback({ type: 'success', text: 'Review submitted successfully!' });
    loadSessions();
  };

  const tabs = [
    { key: 'ALL', label: 'All Sessions' },
    { key: 'ACCEPTED', label: 'Scheduled / Accepted' },
    { key: 'REQUESTED', label: 'Pending Requests' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled / Declined' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Learning & Mentoring Sessions</h1>
          <p className="page-subtitle">
            Manage your schedule, confirm offline sessions, and exchange credits
          </p>
        </div>

        <button type="button" onClick={loadSessions} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

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

      {/* Filter Tabs & Role selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveTab(tab.key);
                setCurrentPage(1);
              }}
              className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
          >
            <option value="all">All Roles (Learner + Mentor)</option>
            <option value="learner">As Learner</option>
            <option value="mentor">As Mentor</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : sessionsList && sessionsList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sessionsList.map((session) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card empty-state">
          <Calendar size={48} className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h3>No sessions found</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            There are no sessions matching your current tab and role filter.
          </p>
        </div>
      )}

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

export default MySessionsPage;
