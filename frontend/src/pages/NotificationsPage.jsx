import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  selectNotifications
} from '../redux/slices/notificationSlice';
import { notificationAPI } from '../services';
import {
  Bell,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  Star,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, total, loading } = useSelector(selectNotifications);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications({ unreadOnly }));
  }, [dispatch, unreadOnly]);

  const handleMarkRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      dispatch(fetchNotifications({ unreadOnly }));
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'SESSION_REQUESTED':
      case 'SESSION_ACCEPTED':
      case 'SESSION_COMPLETED':
      case 'SESSION_RESCHEDULED':
        return <Calendar size={18} color="var(--primary)" />;
      case 'CREDIT_EARNED':
      case 'CREDIT_SPENT':
        return <CreditCard size={18} color="var(--accent-emerald)" />;
      case 'REVIEW_RECEIVED':
        return <Star size={18} color="#f59e0b" />;
      default:
        return <Info size={18} color="var(--accent-blue)" />;
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Stay updated with session requests, completion reminders, and credit updates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {unreadCount > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleMarkAllRead}
            >
              <CheckCheck size={15} /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input
          type="checkbox"
          id="unreadOnly"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
        />
        <label htmlFor="unreadOnly" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
          Show unread notifications only ({unreadCount})
        </label>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className="card"
              style={{
                padding: '1rem 1.25rem',
                backgroundColor: notif.isRead ? 'var(--bg-surface)' : 'var(--primary-light)',
                borderLeft: notif.isRead ? '1px solid var(--border-color)' : '4px solid var(--primary)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}
            >
              <div style={{ marginTop: '2px' }}>{getNotifIcon(notif.type)}</div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {notif.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {notif.message}
                </p>

                {/* Optional session action link */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  {notif.relatedSessionId && (
                    <Link
                      to="/sessions"
                      style={{ fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      View in Sessions <ExternalLink size={12} />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(notif._id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(notif._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: 0,
                      marginLeft: 'auto'
                    }}
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <Bell size={40} className="empty-state-icon" style={{ margin: '0 auto' }} />
          <h4>No Notifications Found</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
