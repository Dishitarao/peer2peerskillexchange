import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, BookOpen } from 'lucide-react';

const MentorCard = ({ mentor, skills = [] }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <img
          src={
            mentor.profilePicture ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${mentor.firstName || 'User'}`
          }
          alt={mentor.firstName}
          style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
        />
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {mentor.firstName} {mentor.lastName}
          </h3>
          {mentor.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <MapPin size={13} /> {mentor.location}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <Star size={14} fill={mentor.rating?.average > 0 ? '#f59e0b' : 'none'} color="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              {mentor.rating?.average > 0 ? mentor.rating.average.toFixed(1) : 'New'}
            </span>
            {mentor.rating?.count > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({mentor.rating.count} reviews)</span>
            )}
          </div>
        </div>
      </div>

      {/* Bio */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', flex: 1, marginBottom: '1rem', lineHeight: 1.5 }}>
        {mentor.bio ? (mentor.bio.length > 110 ? `${mentor.bio.substring(0, 110)}...` : mentor.bio) : 'Enthusiastic mentor ready to share knowledge and help peers grow.'}
      </p>

      {/* Teachable Skills Snippet */}
      {skills.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Teaches:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {skills.slice(0, 3).map((sk) => (
              <span key={sk._id} className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                {sk.title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability Preview */}
      {mentor.availability && mentor.availability.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          <Calendar size={14} color="var(--primary)" />
          <span>Available {mentor.availability.map((a) => a.day.slice(0, 3)).join(', ')}</span>
        </div>
      )}

      <Link to={`/mentors/${mentor._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: 'auto' }}>
        View Full Profile & Book
      </Link>
    </div>
  );
};

export default MentorCard;
