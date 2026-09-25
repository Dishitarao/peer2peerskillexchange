import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../redux/slices/authSlice';
import { userAPI, skillAPI } from '../services';
import SkillCard from '../components/skills/SkillCard';
import StarRating from '../components/common/StarRating';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ProfilePage = () => {
  const { user: authUser } = useSelector(selectAuth);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getProfile();
      setProfileData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill listing?')) return;
    try {
      await skillAPI.deleteSkill(skillId);
      setFeedback({ type: 'success', text: 'Skill listing removed.' });
      fetchProfile();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete skill.' });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  const user = profileData?.user || authUser;
  const skills = profileData?.teachingSkills || [];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

      {/* Main Profile Header Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img
            src={
              user?.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'User'}`
            }
            alt={user?.firstName}
            style={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--border-color)'
            }}
          />

          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                  {user?.firstName} {user?.lastName}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={14} /> {user?.email}
                  </span>
                  {user?.phone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={14} /> {user?.phone}
                    </span>
                  )}
                  {user?.location && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> {user?.location}
                    </span>
                  )}
                </div>
              </div>

              <Link to="/profile/edit" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Edit size={14} /> Edit Profile
              </Link>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.75rem' }}>
              <StarRating rating={user?.rating?.average || 0} size={16} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ({user?.rating?.count || 0} student ratings)
              </span>
            </div>

            {/* Bio */}
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
              {user?.bio || 'No bio provided yet.'}
            </p>

            {/* Interests & Skills to Learn */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {user?.interests && user.interests.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>INTERESTS:</span>
                  {user.interests.map((i, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                      {i}
                    </span>
                  ))}
                </div>
              )}

              {user?.skillsToLearn && user.skillsToLearn.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>WANTS TO LEARN:</span>
                  {user.skillsToLearn.map((s, idx) => (
                    <span key={idx} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} color="var(--primary)" /> Teaching Availability
            </h3>
            <Link to="/profile/edit" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Update Schedule
            </Link>
          </div>

          {user?.availability && user.availability.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.availability.map((slot, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--bg-surface-hover)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem'
                  }}
                >
                  <strong>{slot.day}:</strong> {slot.startTime} - {slot.endTime}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No availability schedule set. Configure your days/hours in Edit Profile.
            </p>
          )}
        </div>
      </div>

      {/* Teaching Skills Management */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>My Teaching Skills ({skills.length})</h2>
          <Link to="/skills/add" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Add New Skill
          </Link>
        </div>

        {skills.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {skills.map((skill) => (
              <div
                key={skill._id}
                className="card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-primary">{skill.category}</span>
                    <span className="badge badge-neutral">{skill.level}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{skill.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {skill.description}
                  </p>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '0.5rem' }}>
                    {skill.creditsPerHour} credits / session
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(skill._id)}
                    className="btn btn-danger btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <h4>You have not listed any skills yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Add subjects you are good at to start mentoring and earning credits.
            </p>
            <Link to="/skills/add" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Add Your First Skill
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
