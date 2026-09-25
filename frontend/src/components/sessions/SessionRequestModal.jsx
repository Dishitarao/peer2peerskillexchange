import React, { useState } from 'react';
import { X, Calendar, Clock, CreditCard, AlertCircle } from 'lucide-react';

const SessionRequestModal = ({ isOpen, onClose, skill, onSubmit, userBalance = 0 }) => {
  if (!isOpen || !skill) return null;

  const mentor = skill.userId || {};
  const today = new Date().toISOString().split('T')[0];

  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const creditsRequired = skill.creditsPerHour || 10;
  const hasSufficientCredits = userBalance >= creditsRequired;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!sessionDate) {
      setError('Please select a date for the session.');
      return;
    }

    if (!hasSufficientCredits) {
      setError(`Insufficient credits. You have ${userBalance} credits, but this session requires ${creditsRequired} credits.`);
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        mentorId: mentor._id,
        skillId: skill._id,
        sessionDate,
        startTime,
        durationMinutes: Number(durationMinutes),
        notes
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit session request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Request Learning Session</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              with {mentor.firstName} {mentor.lastName}
            </p>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} style={{ border: 'none' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Skill summary card */}
            <div
              style={{
                backgroundColor: 'var(--bg-surface-hover)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{skill.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{skill.category} • {skill.level}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                  {creditsRequired} credits
                </div>
                <div style={{ fontSize: '0.75rem', color: hasSufficientCredits ? 'var(--text-secondary)' : 'var(--accent-rose)' }}>
                  Your Balance: {userBalance}
                </div>
              </div>
            </div>

            {/* Date picker */}
            <div className="form-group">
              <label className="form-label">Session Date</label>
              <input
                type="date"
                min={today}
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Start Time & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="form-select"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes (1 hour)</option>
                  <option value={90}>90 Minutes</option>
                  <option value={120}>120 Minutes (2 hours)</option>
                </select>
              </div>
            </div>

            {/* Notes / Goals */}
            <div className="form-group">
              <label className="form-label">Learning Goals / Notes for Mentor (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What topics or questions would you like to focus on during this session?"
                className="form-textarea"
                rows={3}
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              * Note: Credits are only transferred after the session has taken place and both you and your mentor confirm completion.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !hasSufficientCredits}
            >
              {loading ? 'Submitting...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionRequestModal;
