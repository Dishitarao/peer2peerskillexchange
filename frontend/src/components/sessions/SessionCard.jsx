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

  // ── End-time gate helper ──────────────────────────────────────────────────
  // Confirmation is allowed only AFTER the session's scheduled END time.
  //
  // WHY new Date(y, m, d, h, min) instead of setUTCHours:
  //   sessionDate arrives from MongoDB as midnight UTC (e.g. "2026-09-26T00:00:00.000Z").
  //   endTime is a plain "HH:MM" string representing LOCAL wall-clock time.
  //
  //   setUTCHours(17, 45) creates 17:45 UTC — displayed in IST (+5:30) as
  //   23:15 / "10:15 PM", which caused the reported bug.
  //
  //   new Date(y, m, d, 17, 45) creates 17:45 in the browser's LOCAL timezone,
  //   matching the time the user actually intended.
  const sessionHasEnded = (() => {
    if (!session.sessionDate || !session.endTime) return false;
    const [h, m] = session.endTime.split(':').map(Number);
    const base = new Date(session.sessionDate);        // midnight UTC
    // Use local date components so the resulting Date is in local time:
    const sessionEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0);
    return Date.now() >= sessionEnd.getTime();
  })();

  // Human-readable session END time for the "Confirmation available from" notice.
  // Built the same way so it displays the correct local time.
  const sessionEndDisplay = (() => {
    if (!session.sessionDate || !session.endTime) return '';
    const [h, m] = session.endTime.split(':').map(Number);
    const base = new Date(session.sessionDate);
    const sessionEnd = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m, 0, 0);
    return sessionEnd.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  })();
  // ─────────────────────────────────────────────────────────────────────────

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

      {/* DUAL CONFIRMATION STATUS (for Accepted sessions) */}
      {session.status === 'ACCEPTED' && (
        <div
          style={{
            border: `1px solid ${sessionHasEnded ? 'var(--border-color)' : 'var(--accent-amber)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem',
            backgroundColor: sessionHasEnded ? 'var(--bg-primary)' : 'var(--accent-amber-light, #fffbeb)'
          }}
        >
          {/* Pre-end notice: session has not ended yet */}
          {!sessionHasEnded && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem', fontSize: '0.85rem', color: 'var(--accent-amber)', fontWeight: 700 }}>
              <Hourglass size={15} />
              Session has not ended yet. Confirmation available from {sessionEndDisplay}.
            </div>
          )}

          {/* Post-end notice (before anyone confirms) */}
          {sessionHasEnded && !session.mentorConfirmedCompletion && !session.learnerConfirmedCompletion && (
            <div style={{ marginBottom: '0.6rem', fontSize: '0.825rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
              Session has ended — you can now confirm that it was conducted.
            </div>
          )}

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
                {session.mentorConfirmedCompletion ? 'Confirmed ✓' : 'Pending'}
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
                {session.learnerConfirmedCompletion ? 'Confirmed ✓' : 'Pending'}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {sessionHasEnded
              ? '* Both mentor and learner must confirm that the session was conducted for completion and credit exchange.'
              : `* Confirmation will be available from ${sessionEndDisplay}.`}
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
            disabled={currentUserConfirmed || !sessionHasEnded || isProcessing}
            onClick={handleConfirm}
            style={{ marginLeft: 'auto' }}
            title={
              !sessionHasEnded
                ? `Available from ${sessionEndDisplay}`
                : currentUserConfirmed
                ? 'You have already confirmed this session'
                : 'Confirm that this session was conducted'
            }
          >
            <UserCheck size={15} />
            {currentUserConfirmed
              ? 'Awaiting Peer Confirmation'
              : !sessionHasEnded
              ? 'Session Not Ended Yet'
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
