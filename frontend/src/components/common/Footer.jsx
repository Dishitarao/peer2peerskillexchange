import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="navbar-brand-icon" style={{ width: 28, height: 28 }}>
            <BookOpen size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>SkillSync Platform</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Empowering peer-to-peer knowledge sharing and learning.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
          <Link to="/skills">Explore Skills</Link>
          <Link to="/mentors">Find Mentors</Link>
          <Link to="/wallet">Credit System</Link>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} P2P Skill Exchange. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
