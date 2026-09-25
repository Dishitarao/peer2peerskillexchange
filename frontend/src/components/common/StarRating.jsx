import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, totalStars = 5, onRatingChange, interactive = false, size = 18 }) => {
  const stars = [];

  for (let i = 1; i <= totalStars; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <button
        key={i}
        type="button"
        disabled={!interactive}
        onClick={() => interactive && onRatingChange && onRatingChange(i)}
        style={{
          background: 'none',
          border: 'none',
          cursor: interactive ? 'pointer' : 'default',
          padding: 2,
          display: 'inline-flex',
          alignItems: 'center',
          color: isFilled ? '#f59e0b' : 'var(--border-color)',
          transition: 'transform 0.1s'
        }}
      >
        <Star size={size} fill={isFilled ? '#f59e0b' : 'none'} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
      {stars}
      {rating > 0 && !interactive && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.35rem', color: 'var(--text-primary)' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
