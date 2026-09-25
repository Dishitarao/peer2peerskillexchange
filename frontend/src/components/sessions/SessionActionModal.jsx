import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

const SessionActionModal = ({ isOpen, onClose, session, actionType, onSubmit }) => {
  if (!isOpen || !session) return null;

  const today = new Date().toISOString().split('T')[0];
  const [reason, setReason] = useState('');
  const [proposedDate, setProposedDate] = useState(session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '');
  const [proposedStartTime, setProposedStartTime] = useState(session.startTime || '14:00');
  const [durationMinutes, setDurationMinutes] = useState(session.durationMinutes || 60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTitle = () => {
    switch (actionType) {
      case 'CANCEL':
        return 'Cancel Session';
      case 'REJECT':
        return 'Decline Session Request';
      case 'RESCHEDULE':
        return 'Reschedule Session';
      default:
        return 'Session Action';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (actionType === 'RESCHEDULE') {
        await onSubmit({
          proposedDate,
          proposedStartTime,
          durationMinutes: Number(durationMinutes),
          reason
        });
      } else {
        await onSubmit(reason);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{getTitle()}</h3>
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

            {actionType === 'RESCHEDULE' ? (
              <>
                <div className="form-group">
                  <label className="form-label">New Proposed Date</label>
                  <input
                    type="date"
                    min={today}
                    value={proposedDate}
                    onChange={(e) => setProposedDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      value={proposedStartTime}
                      onChange={(e) => setProposedStartTime(e.target.value)}
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
                      <option value={30}>30 Min</option>
                      <option value={45}>45 Min</option>
                      <option value={60}>60 Min (1h)</option>
                      <option value={90}>90 Min</option>
                      <option value={120}>120 Min (2h)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Rescheduling (Optional)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a brief explanation for rescheduling..."
                    className="form-textarea"
                    rows={2}
                  />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label className="form-label">
                  Reason for {actionType === 'CANCEL' ? 'cancellation' : 'declining'} (Optional)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide a brief reason..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Back
            </button>
            <button
              type="submit"
              className={`btn ${actionType === 'CANCEL' || actionType === 'REJECT' ? 'btn-danger' : 'btn-primary'}`}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Confirm ${actionType.toLowerCase()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionActionModal;
