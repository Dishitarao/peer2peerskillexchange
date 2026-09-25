import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchSkills, fetchCategories, selectSkills, setFilter, resetFilters, setPage } from '../redux/slices/skillSlice';
import { selectAuth } from '../redux/slices/authSlice';
import { sessionAPI } from '../services';
import SkillCard from '../components/skills/SkillCard';
import SessionRequestModal from '../components/sessions/SessionRequestModal';
import { Search, Filter, RotateCcw, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

const SkillsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { skills, categories, total, page, totalPages, loading, filters } = useSelector(selectSkills);
  const { user, isAuthenticated } = useSelector(selectAuth);

  const [bookingSkill, setBookingSkill] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Sync URL search params with Redux filters on initial mount or URL change
  useEffect(() => {
    dispatch(fetchCategories());

    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlLevel = searchParams.get('level');

    if (urlCategory || urlSearch || urlLevel) {
      dispatch(
        setFilter({
          category: urlCategory || 'All',
          search: urlSearch || '',
          level: urlLevel || 'All'
        })
      );
    }
  }, [dispatch, searchParams]);

  // Perform search when filters or page change
  useEffect(() => {
    dispatch(
      searchSkills({
        search: filters.search,
        category: filters.category,
        level: filters.level,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
        page
      })
    );
  }, [dispatch, filters, page]);

  const handleSearchChange = (e) => {
    dispatch(setFilter({ search: e.target.value }));
  };

  const handleCategoryChange = (e) => {
    dispatch(setFilter({ category: e.target.value }));
  };

  const handleLevelChange = (e) => {
    dispatch(setFilter({ level: e.target.value }));
  };

  const handleSortChange = (e) => {
    dispatch(setFilter({ sortBy: e.target.value }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchParams({});
  };

  const handleRequestBooking = (skill) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingSkill(skill);
  };

  const handleBookingSubmit = async (requestData) => {
    const res = await sessionAPI.requestSession(requestData);
    setFeedback({
      type: 'success',
      text: 'Session request sent! The mentor has been notified in their dashboard.'
    });
    setBookingSkill(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Skills & Mentors</h1>
          <p className="page-subtitle">
            Find peer experts ready to teach you one-on-one ({total} skills available)
          </p>
        </div>
      </div>

      {/* Feedback Alert */}
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

      {/* Filter / Search Bar Bar */}
      <div
        className="card"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}
      >
        {/* Search input */}
        <div style={{ gridColumn: 'span 2', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search by skill name, topic, or keyword..."
            value={filters.search}
            onChange={handleSearchChange}
            className="form-input"
          />
        </div>

        {/* Category filter */}
        <div>
          <select value={filters.category} onChange={handleCategoryChange} className="form-select">
            <option value="All">All Categories</option>
            {categories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Level filter */}
        <div>
          <select value={filters.level} onChange={handleLevelChange} className="form-select">
            <option value="All">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>

        {/* Sort option */}
        <div>
          <select value={filters.sortBy} onChange={handleSortChange} className="form-select">
            <option value="newest">Newest First</option>
            <option value="credits-asc">Credits: Low to High</option>
            <option value="credits-desc">Credits: High to Low</option>
            <option value="title">Skill Title (A-Z)</option>
          </select>
        </div>

        {/* Reset */}
        <div>
          <button type="button" onClick={handleReset} className="btn btn-secondary" style={{ width: '100%' }}>
            <RotateCcw size={15} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : skills && skills.length > 0 ? (
        <>
          <div className="grid-cols-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                isOwner={user?.id === skill.userId?._id}
                onRequestSession={handleRequestBooking}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card empty-state">
          <Search size={48} className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h3>No skills found</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            Try adjusting your search terms or clearing category filters.
          </p>
          <button type="button" onClick={handleReset} className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
            Reset Filters
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <SessionRequestModal
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
        skill={bookingSkill}
        onSubmit={handleBookingSubmit}
        userBalance={user?.walletBalance ?? 100}
      />
    </div>
  );
};

export default SkillsPage;
