import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth, logout } from '../../redux/slices/authSlice';
import { selectNotifications } from '../../redux/slices/notificationSlice';
import { useTheme } from '../../context/ThemeContext';
import {
  BookOpen,
  Compass,
  Users,
  LayoutDashboard,
  Calendar,
  CreditCard,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const { unreadCount } = useSelector(selectNotifications);
  const { theme, toggleTheme, isDark } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <BookOpen size={18} />
          </div>
          <span>SkillSync</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar-links" style={{ display: 'flex' }}>
          <NavLink to="/skills" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Compass size={16} /> Explore Skills
          </NavLink>
          <NavLink to="/mentors" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
            <Users size={16} /> Find Mentors
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink to="/sessions" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <Calendar size={16} /> Sessions
              </NavLink>
              <NavLink to="/wallet" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                <CreditCard size={16} /> Wallet
              </NavLink>
            </>
          )}
        </nav>

        {/* Actions / Auth */}
        <div className="navbar-actions">
          {/* Theme Switcher */}
          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Credit Badge */}
              <Link to="/wallet" className="credit-badge" title="Your Credit Balance">
                <CreditCard size={15} />
                <span>{user?.walletBalance ?? 100} credits</span>
              </Link>

              {/* Add Skill Quick Action */}
              <Link to="/skills/add" className="btn btn-primary btn-sm" style={{ display: 'inline-flex' }}>
                <PlusCircle size={15} /> Teach Skill
              </Link>

              {/* Notifications */}
              <Link
                to="/notifications"
                className="btn-icon"
                style={{ position: 'relative' }}
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: 'var(--accent-rose)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px 2px 2px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  <img
                    src={
                      user?.profilePicture ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || 'User'}`
                    }
                    alt={user?.firstName}
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.firstName}</span>
                </button>

                {profileDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px',
                      zIndex: 100,
                      padding: '0.5rem 0'
                    }}
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem'
                      }}
                    >
                      <User size={15} /> My Profile
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.6rem 1rem',
                          color: 'var(--primary)',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}
                      >
                        <Shield size={15} /> Admin Panel
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.6rem 1rem',
                        color: 'var(--accent-rose)',
                        fontSize: '0.875rem',
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderTop: '1px solid var(--border-color)'
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
