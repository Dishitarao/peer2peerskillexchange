import React, { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import { reportAPI } from '../../services';

const ReportModal = ({ isOpen, onClose, targetItem, reportTypeDefault = 'DISPUTE' }) => {
  if (!isOpen) return null;

  const [reportType, setReportType] = useState(reportTypeDefault);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || !description.trim()) {
      setError('Please provide both reason and detailed description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reportAPI.createReport({
        reportedUserId: targetItem?.userId || targetItem?.learnerId?._id || targetItem?.mentorId?._id || null,
        reportedSkillId: targetItem?.skillId?._id || targetItem?._id || null,
        reportType,
        reason,
        description
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag size={18} color="var(--accent-rose)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Report an Issue</h3>
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

            {success && (
              <div className="alert alert-success">
                <span>Report submitted successfully. Platform admins will investigate.</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Report Category</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="form-select"
              >
                <option value="DISPUTE">Session Dispute / No Show</option>
                <option value="INAPPROPRIATE_SKILL">Inappropriate Skill Listing</option>
                <option value="INAPPROPRIATE_USER">Inappropriate Behavior / Harassment</option>
                <option value="INAPPROPRIATE_REVIEW">Abusive Review</option>
                <option value="ABUSE">Spam or Abuse</option>
                <option value="OTHER">Other Reason</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject / Short Reason</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Mentor did not attend scheduled session"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened in detail..."
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
            <button type="submit" className="btn btn-danger" disabled={loading || success}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
