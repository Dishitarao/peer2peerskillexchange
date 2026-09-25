import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Star, MapPin, Tag } from 'lucide-react';

const SkillCard = ({ skill, onRequestSession, isOwner = false }) => {
  const mentor = skill.userId || {};
  const initials = `${mentor.firstName?.[0] || ''}${mentor.lastName?.[0] || ''}`;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header with Category & Level */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span className="badge badge-primary">{skill.category}</span>
        <span className="badge badge-neutral">{skill.level}</span>
      </div>

      {/* Skill Title */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        {skill.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem', lineHeight: 1.5 }}>
        {skill.description?.length > 130
          ? `${skill.description.substring(0, 130)}...`
          : skill.description}
      </p>

      {/* Tags */}
      {skill.tags && skill.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {skill.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Mentor Mini Profile & Rate */}
      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link
          to={`/mentors/${mentor._id}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
        >
          <img
            src={
              mentor.profilePicture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.firstName || 'User'}`
            }
            alt={mentor.firstName}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {mentor.firstName} {mentor.lastName}
            </div>
            {mentor.rating?.average > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', color: '#f59e0b' }}>
                <Star size={12} fill="#f59e0b" />
                <span style={{ fontWeight: 600 }}>{mentor.rating.average.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)' }}>({mentor.rating.count})</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>New Mentor</div>
            )}
          </div>
        </Link>

        {/* Rate & Book Button */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
            {skill.creditsPerHour} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>credits</span>
          </div>
        </div>
      </div>

      {/* Request Button */}
      {!isOwner && onRequestSession && (
        <button
          type="button"
          onClick={() => onRequestSession(skill)}
          className="btn btn-primary btn-sm"
          style={{ width: '100%', marginTop: '0.85rem' }}
        >
          Book Learning Session
        </button>
      )}
    </div>
  );
};

export default SkillCard;
