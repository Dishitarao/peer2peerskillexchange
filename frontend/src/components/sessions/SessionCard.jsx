import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Star,
  Flag,
  UserCheck,
  Hourglass
} from 'lucide-react';

const SessionCard = ({
  session,
  currentUserId,
  onAccept,
  onReject,
  onCancel,
  onReschedule,
  onConfirmCompletion,
  onReview,
  onReport
}) => {
  const isLearner = session.learnerId?._id === currentUserId || session.learnerId === currentUserId;
  const isMentor = session.mentorId?._id === currentUserId || session.mentorId === currentUserId;

  const otherUser = isLearner ? session.mentorId : session.learnerId;
  const roleLabel = isLearner ? 'Your Mentor' : 'Your Learner';

  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="badge badge-success">Accepted / Scheduled</span>;
      case 'REQUESTED':
        return <span className="badge badge-warning">Request Pending</span>;
      case 'COMPLETED':
        return <span className="badge badge-primary">Completed</span>;
      case 'CANCELLED':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'REJECTED':
        return <span className="badge badge-danger">Declined</span>;
      case 'RESCHEDULED':
        return <span className="badge badge-warning">Rescheduled</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirmCompletion(session._id);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check current user's individual completion confirmation status
  const currentUserConfirmed = isMentor
    ? session.mentorConfirmedCompletion
    : session.learnerConfirmedCompletion;

  const otherUserConfirmed = isMentor
    ? session.learnerConfirmedCompletion
    : session.mentorConfirmedCompletion;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Header: Skill & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {session.skillId?.title || 'Session'}
          </h4>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Category: {session.skillId?.category || 'Skill Share'}
          </div>
        </div>
        <div>{getStatusBadge(session.status)}</div>
      </div>

      {/* Date & Time details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          backgroundColor: 'var(--bg-surface-hover)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Calendar size={15} color="var(--primary)" />
          <span>{new Date(session.sessionDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Clock size={15} color="var(--accent-blue)" />
          <span>{session.startTime} - {session.endTime} ({session.durationMinutes || 60}m)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <CreditCard size={15} color="var(--accent-emerald)" />
          <span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
            {session.creditsExchanged} credits
          </span>
        </div>
      </div>

      {/* Peer Participant Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={
              otherUser?.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${otherUser?.firstName || 'User'}`
            }
            alt={otherUser?.firstName}
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              {roleLabel}
            </div>
            <Link to={`/mentors/${otherUser?._id}`} style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Link>
          </div>
        </div>

        {/* Report Button */}
        {onReport && (
          <button
            type="button"
            className="btn-icon"
            style={{ border: 'none', color: 'var(--text-muted)' }}
            onClick={() => onReport(session)}
            title="Report Session or Participant"
          >
            <Flag size={15} />
          </button>
        )}
      </div>

      {/* Notes / Topic */}
      {session.notes && (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
          <strong>Session Topic/Notes:</strong> {session.notes}
        </div>
      )}

      {/* DUAL CONFIRMATION STATUS (for Accepted / In-progress sessions) */}
      {session.status === 'ACCEPTED' && (
        <div
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            backgroundColor: 'var(--bg-primary)'
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Session Completion Workflow (Dual Confirmation):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {session.mentorConfirmedCompletion ? (
                <CheckCircle size={15} color="var(--accent-emerald)" />
              ) : (
                <Hourglass size={15} color="var(--accent-amber)" />
              )}
              <span>
                <strong>Mentor Confirmation:</strong>{' '}
                {session.mentorConfirmedCompletion ? 'Confirmed' : 'Pending'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {session.learnerConfirmedCompletion ? (
                <CheckCircle size={15} color="var(--accent-emerald)" />
              ) : (
                <Hourglass size={15} color="var(--accent-amber)" />
              )}
              <span>
                <strong>Learner Confirmation:</strong>{' '}
                {session.learnerConfirmedCompletion ? 'Confirmed' : 'Pending'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            * Both mentor and learner must confirm that the offline session was conducted for completion and credit exchange.
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
        {/* Mentor responding to request */}
        {session.status === 'REQUESTED' && isMentor && (
          <>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => onAccept(session._id)}
            >
              <CheckCircle size={15} /> Accept Request
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onReject(session)}
            >
              <XCircle size={15} /> Decline
            </button>
          </>
        )}

        {/* Both can cancel or reschedule if REQUESTED or ACCEPTED */}
        {(session.status === 'REQUESTED' || session.status === 'ACCEPTED') && (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onReschedule(session)}
            >
              <RefreshCw size={14} /> Reschedule
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              style={{ backgroundColor: 'transparent', color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
              onClick={() => onCancel(session)}
            >
              <XCircle size={14} /> Cancel
            </button>
          </>
        )}

        {/* MANUAL COMPLETION BUTTON (when ACCEPTED) */}
        {session.status === 'ACCEPTED' && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={currentUserConfirmed || isProcessing}
            onClick={handleConfirm}
            style={{ marginLeft: 'auto' }}
          >
            <UserCheck size={15} />
            {currentUserConfirmed
              ? 'Awaiting Peer Confirmation'
              : 'Confirm Session Conducted'}
          </button>
        )}

        {/* COMPLETED ACTIONS: Leave Review */}
        {session.status === 'COMPLETED' && onReview && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onReview(session)}
            style={{ marginLeft: 'auto' }}
          >
            <Star size={14} color="#f59e0b" fill="#f59e0b" /> Leave / View Review
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionCard;
