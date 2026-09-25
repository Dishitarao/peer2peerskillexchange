import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchTrendingSkills, selectSkills } from '../redux/slices/skillSlice';
import { selectAuth } from '../redux/slices/authSlice';
import SkillCard from '../components/skills/SkillCard';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Repeat,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  Users
} from 'lucide-react';

const LandingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, trendingSkills } = useSelector(selectSkills);
  const { isAuthenticated } = useSelector(selectAuth);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchTrendingSkills());
  }, [dispatch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-primary) 100%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          marginTop: '1rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          <Sparkles size={16} /> Decentralized Peer-to-Peer Learning
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '850px',
            margin: '0 auto 1.5rem auto'
          }}
        >
          Teach what you know. <br />
          <span style={{ color: 'var(--primary)' }}>Learn what you need.</span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            maxWidth: '650px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.6
          }}
        >
          An equitable marketplace where students exchange skills using virtual credits. No subscriptions, no payments — just mutual knowledge sharing.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/skills" className="btn btn-primary btn-lg">
            Explore All Skills <ArrowRight size={18} />
          </Link>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-secondary btn-lg">
              Join with 100 Free Credits
            </Link>
          )}
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>How SkillSync Works</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>A sustainable, credit-based peer learning model</p>
        </div>

        <div className="grid-cols-3">
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <Zap size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. List Your Skills</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Offer skills in programming, languages, design, or academics. Set your availability and credits per session.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <Repeat size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. Book & Conduct</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Schedule sessions with compatible peers. Conduct your 1-on-1 tutoring sessions seamlessly.
            </p>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <Award size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Dual Confirmation</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Both learner and mentor confirm completion. Credits transfer safely to reward the mentor, and ratings update!
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories && categories.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Explore Categories</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Browse skills by topic</p>
            </div>
            <Link to="/skills" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {categories.map((cat, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(`/skills?category=${encodeURIComponent(cat)}`)}
                className="btn btn-secondary"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.2rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Trending Skills Section */}
      {trendingSkills && trendingSkills.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Popular & Trending Skills</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Top rated mentors ready to teach</p>
            </div>
            <Link to="/skills" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Discover More →
            </Link>
          </div>

          <div className="grid-cols-3">
            {trendingSkills.map((skill) => (
              <SkillCard
                key={skill._id}
                skill={skill}
                onRequestSession={() => navigate(`/skills?skillId=${skill._id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingPage;
