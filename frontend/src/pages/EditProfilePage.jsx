import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth, setUser } from '../redux/slices/authSlice';
import { userAPI } from '../services';
import { Save, Plus, Trash2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    profilePicture: '',
    interestsInput: '',
    skillsToLearnInput: '',
    availability: []
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        interestsInput: (user.interests || []).join(', '),
        skillsToLearnInput: (user.skillsToLearn || []).join(', '),
        availability: user.availability || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddSlot = () => {
    setFormData((prev) => ({
      ...prev,
      availability: [
        ...prev.availability,
        { day: 'Monday', startTime: '09:00', endTime: '12:00' }
      ]
    }));
  };

  const handleRemoveSlot = (index) => {
    setFormData((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, idx) => idx !== index)
    }));
  };

  const handleSlotChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.availability];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, availability: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    const interests = formData.interestsInput
      ? formData.interestsInput.split(',').map((i) => i.trim()).filter(Boolean)
      : [];
    const skillsToLearn = formData.skillsToLearnInput
      ? formData.skillsToLearnInput.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      const res = await userAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        interests,
        skillsToLearn,
        availability: formData.availability
      });

      dispatch(setUser(res.data.data));
      setFeedback({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div style={{ maxWidth: 720, margin: '1rem auto' }}>
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit Profile & Availability</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Update your personal details, teaching slots, and learning goals
          </p>
        </div>

        {feedback && (
          <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
            {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Location / Campus</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Picture Image URL</label>
            <input
              type="text"
              name="profilePicture"
              placeholder="https://images.unsplash.com/..."
              value={formData.profilePicture}
              onChange={handleChange}
              className="form-input"
            />
            <span className="form-hint">Enter an image URL or leave blank to use avatar</span>
          </div>

          <div className="form-group">
            <label className="form-label">About / Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interests (Comma-separated)</label>
            <input
              type="text"
              name="interestsInput"
              value={formData.interestsInput}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Skills You Want to Learn (Comma-separated)</label>
            <input
              type="text"
              name="skillsToLearnInput"
              value={formData.skillsToLearnInput}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Availability Schedule Section */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Weekly Teaching Availability</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Learners will view these available windows when booking sessions
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSlot}
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={14} /> Add Slot
              </button>
            </div>

            {formData.availability.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {formData.availability.map((slot, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr 1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-surface-hover)',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <select
                      value={slot.day}
                      onChange={(e) => handleSlotChange(idx, 'day', e.target.value)}
                      className="form-select"
                    >
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>

                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => handleSlotChange(idx, 'startTime', e.target.value)}
                      className="form-input"
                    />

                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => handleSlotChange(idx, 'endTime', e.target.value)}
                      className="form-input"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(idx)}
                      className="btn-icon"
                      style={{ border: 'none', color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No availability slots added yet. Click "+ Add Slot" to set your teaching schedule.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
