import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { skillAPI } from '../services';
import { PlusCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const AddSkillPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Programming & Tech',
    level: 'Intermediate',
    creditsPerHour: 15,
    tagsInput: '',
    description: '',
    isAvailableToTeach: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tags = formData.tagsInput
      ? formData.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      await skillAPI.createSkill({
        title: formData.title,
        category: formData.category,
        level: formData.level,
        creditsPerHour: Number(formData.creditsPerHour),
        tags,
        description: formData.description,
        isAvailableToTeach: formData.isAvailableToTeach
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create skill listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: '1.5rem auto' }}>
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>List a Skill to Teach</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Share your knowledge with fellow students and earn platform credits per session.
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Skill / Subject Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Modern React & State Management"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="Programming & Tech">Programming & Tech</option>
                <option value="Design & Creative">Design & Creative</option>
                <option value="Languages">Languages</option>
                <option value="Academics & Science">Academics & Science</option>
                <option value="Business & Marketing">Business & Marketing</option>
                <option value="Music & Arts">Music & Arts</option>
                <option value="Fitness & Health">Fitness & Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Proficiency Level *</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Credits per Session/Hour *</label>
              <input
                type="number"
                name="creditsPerHour"
                min="1"
                max="500"
                value={formData.creditsPerHour}
                onChange={handleChange}
                className="form-input"
                required
              />
              <span className="form-hint">Standard rate: 10 - 25 credits</span>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (Comma-separated)</label>
              <input
                type="text"
                name="tagsInput"
                placeholder="e.g. React, JavaScript, Hooks"
                value={formData.tagsInput}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & What You Will Teach *</label>
            <textarea
              name="description"
              placeholder="Outline what learners can expect to learn during your sessions..."
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows={5}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
            <input
              type="checkbox"
              id="isAvailableToTeach"
              name="isAvailableToTeach"
              checked={formData.isAvailableToTeach}
              onChange={handleChange}
            />
            <label htmlFor="isAvailableToTeach" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
              I am currently accepting new session requests for this skill.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Skill Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillPage;
