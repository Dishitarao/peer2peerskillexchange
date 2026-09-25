import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services';
import {
  Shield,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  UserCheck,
  UserX
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS, USERS, SKILLS, REPORTS, TRANSACTIONS
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [reports, setReports] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters & search
  const [userSearch, setUserSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('ALL');

  // Report resolution modal
  const [resolvingReport, setResolvingReport] = useState(null);
  const [resolutionData, setResolutionData] = useState({ status: 'RESOLVED', adminNotes: '', actionTaken: '' });

  // Suspend user modal
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState('Community guidelines violation');

  // Credit adjustment modal
  const [creditAdjustment, setCreditAdjustment] = useState({ isOpen: false, userId: '', amount: 50, reason: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ANALYTICS') {
        const res = await adminAPI.getAnalytics();
        setAnalytics(res.data.data);
      } else if (activeTab === 'USERS') {
        const res = await adminAPI.getAllUsers({ search: userSearch, limit: 30 });
        setUsers(res.data.data.users);
      } else if (activeTab === 'SKILLS') {
        const res = await adminAPI.getAllSkills({ limit: 30 });
        setSkills(res.data.data.skills);
      } else if (activeTab === 'REPORTS') {
        const res = await adminAPI.getReports({ status: reportStatus, limit: 30 });
        setReports(res.data.data.reports);
      } else if (activeTab === 'TRANSACTIONS') {
        const res = await adminAPI.getAllTransactions({ limit: 30 });
        setTransactions(res.data.data.transactions);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to load admin data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, reportStatus]);

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers({ search: userSearch, limit: 30 });
      setUsers(res.data.data.users);
    } finally {
      setLoading(false);
    }
  };

  // User Actions
  const handleSuspendUser = async () => {
    if (!suspendingUser) return;
    try {
      await adminAPI.suspendUser(suspendingUser._id, suspensionReason);
      setFeedback({ type: 'success', text: `User ${suspendingUser.firstName} suspended.` });
      setSuspendingUser(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  const handleActivateUser = async (user) => {
    try {
      await adminAPI.activateUser(user._id);
      setFeedback({ type: 'success', text: `User ${user.firstName} reactivated.` });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Skill Moderation
  const handleModerateSkill = async (skillId, isActive, title) => {
    try {
      await adminAPI.moderateSkill(skillId, isActive, 'Moderator review action');
      setFeedback({
        type: 'success',
        text: `Skill "${title}" ${isActive ? 'activated' : 'deactivated'}.`
      });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Report Resolution
  const handleResolveReport = async (e) => {
    e.preventDefault();
    if (!resolvingReport) return;
    try {
      await adminAPI.resolveReport(resolvingReport._id, resolutionData);
      setFeedback({ type: 'success', text: 'Report updated and resolved.' });
      setResolvingReport(null);
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Credit Adjustment
  const handleAdjustCredits = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.adjustWallet({
        userId: creditAdjustment.userId,
        amount: Number(creditAdjustment.amount),
        reason: creditAdjustment.reason
      });
      setFeedback({ type: 'success', text: 'Credits adjusted successfully.' });
      setCreditAdjustment({ isOpen: false, userId: '', amount: 50, reason: '' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Shield size={16} /> Administrator Control Center
          </div>
          <h1 className="page-title">Platform Administration</h1>
          <p className="page-subtitle">
            Manage users, moderate skills, resolve disputes, and monitor credit transactions
          </p>
        </div>

        <button type="button" onClick={loadData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {feedback && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
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

      {/* Tab Navigators */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ANALYTICS')}
          className={`btn btn-sm ${activeTab === 'ANALYTICS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Calendar size={14} /> System Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`btn btn-sm ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={14} /> User Accounts
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SKILLS')}
          className={`btn btn-sm ${activeTab === 'SKILLS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={14} /> Skill Moderation
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={`btn btn-sm ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Flag size={14} /> Reported Issues
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`btn btn-sm ${activeTab === 'TRANSACTIONS' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <CreditCard size={14} /> Credit Logs
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <>
          {/* TAB 1: SYSTEM ANALYTICS */}
          {activeTab === 'ANALYTICS' && analytics && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="grid-cols-4">
                <div className="card">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Users
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {analytics.users?.total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                    {analytics.users?.active} active • {analytics.users?.suspended} suspended
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Skills
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {analytics.skills?.total}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                    {analytics.skills?.active} actively listed
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Completed Sessions
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                    {analytics.sessions?.completed}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {analytics.sessions?.accepted} scheduled • {analytics.sessions?.requested} pending
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    Credits Exchanged
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.25rem' }}>
                    {analytics.credits?.totalExchanged}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Pending Reports: {analytics.reports?.pending}
                  </div>
                </div>
              </div>

              {/* Recent System Activity */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Recent Sessions Across Platform
                  </h3>
                  {analytics.recentSessions && analytics.recentSessions.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {analytics.recentSessions.map((s) => (
                        <div
                          key={s._id}
                          style={{
                            padding: '0.6rem 0.75rem',
                            backgroundColor: 'var(--bg-surface-hover)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{s.skillId?.title || 'Session'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {s.learnerId?.firstName} (Learner) ↔ {s.mentorId?.firstName} (Mentor) • Status: <strong>{s.status}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No sessions yet.</p>
                  )}
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Recent Flagged Issues & Reports
                  </h3>
                  {analytics.recentReports && analytics.recentReports.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {analytics.recentReports.map((r) => (
                        <div
                          key={r._id}
                          style={{
                            padding: '0.6rem 0.75rem',
                            backgroundColor: 'var(--bg-surface-hover)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <div style={{ fontWeight: 600, color: 'var(--accent-rose)' }}>{r.reason}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Reported by {r.reporterId?.firstName} • Status: <strong>{r.status}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No recent reports.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'USERS' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>User Accounts Management</h3>

                <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="form-input"
                    style={{ width: '220px', padding: '0.4rem 0.75rem' }}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">
                    <Search size={14} /> Search
                  </button>
                </form>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email / Phone</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.location || 'No location'}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          <div>{u.email}</div>
                          <div style={{ color: 'var(--text-muted)' }}>{u.phone}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-neutral'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          {u.isSuspended ? (
                            <span className="badge badge-danger">Suspended</span>
                          ) : (
                            <span className="badge badge-success">Active</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          ★ {u.rating?.average || 0} ({u.rating?.count || 0})
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {u.role !== 'admin' && (
                              <>
                                {u.isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => handleActivateUser(u)}
                                    className="btn btn-success btn-sm"
                                  >
                                    <UserCheck size={13} /> Activate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setSuspendingUser(u)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    <UserX size={13} /> Suspend
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setCreditAdjustment({ isOpen: true, userId: u._id, amount: 50, reason: 'Admin bonus credit adjustment' })}
                                  className="btn btn-secondary btn-sm"
                                >
                                  ± Credits
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SKILL MODERATION */}
          {activeTab === 'SKILLS' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Skill Listings Moderation
              </h3>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Skill Title</th>
                      <th>Category & Level</th>
                      <th>Mentor</th>
                      <th>Credits/Hr</th>
                      <th>Listing Status</th>
                      <th>Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((sk) => (
                      <tr key={sk._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{sk.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {sk.description?.substring(0, 70)}...
                          </div>
                        </td>
                        <td>
                          <div>{sk.category}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sk.level}</div>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {sk.userId?.firstName} {sk.userId?.lastName}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          {sk.creditsPerHour} cr
                        </td>
                        <td>
                          {sk.isActive ? (
                            <span className="badge badge-success">Listed</span>
                          ) : (
                            <span className="badge badge-danger">Unlisted</span>
                          )}
                        </td>
                        <td>
                          {sk.isActive ? (
                            <button
                              type="button"
                              onClick={() => handleModerateSkill(sk._id, false, sk.title)}
                              className="btn btn-danger btn-sm"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleModerateSkill(sk._id, true, sk.title)}
                              className="btn btn-success btn-sm"
                            >
                              Approve / Activate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: REPORT MANAGEMENT */}
          {activeTab === 'REPORTS' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Disputes & Flagged Content</h3>

                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                >
                  <option value="ALL">All Reports</option>
                  <option value="PENDING">Pending Only</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>

              {reports && reports.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reports.map((rep) => (
                    <div
                      key={rep._id}
                      style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        backgroundColor: rep.status === 'PENDING' ? 'var(--accent-amber-light)' : 'var(--bg-surface)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span className="badge badge-danger">{rep.reportType}</span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem' }}>
                            {rep.reason}
                          </h4>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Reported by {rep.reporterId?.firstName} {rep.reporterId?.lastName} on {new Date(rep.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <span className={`badge ${rep.status === 'RESOLVED' ? 'badge-success' : 'badge-warning'}`}>
                          {rep.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                        "{rep.description}"
                      </p>

                      {rep.adminNotes && (
                        <div style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-surface-hover)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                          <strong>Admin Notes:</strong> {rep.adminNotes} (Action: {rep.actionTaken || 'None'})
                        </div>
                      )}

                      {rep.status !== 'RESOLVED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setResolvingReport(rep);
                            setResolutionData({ status: 'RESOLVED', adminNotes: '', actionTaken: 'Investigated and resolved' });
                          }}
                          className="btn btn-primary btn-sm"
                        >
                          Resolve Report
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                  No reports found under this status.
                </p>
              )}
            </div>
          )}

          {/* TAB 5: TRANSACTION LOGS */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                System Transaction Audit Logs
              </h3>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                      <th>Date</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td style={{ fontSize: '0.85rem' }}>
                          {tx.userId?.firstName} {tx.userId?.lastName} ({tx.userId?.email})
                        </td>
                        <td>
                          <span className="badge badge-neutral">{tx.type}</span>
                        </td>
                        <td style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </td>
                        <td style={{ fontWeight: 600 }}>{tx.balanceAfter}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{tx.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Suspend User Modal */}
      {suspendingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Suspend User: {suspendingUser.firstName} {suspendingUser.lastName}
              </h3>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Suspension Reason</label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  className="form-textarea"
                  rows={3}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSuspendingUser(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleSuspendUser}>
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Report Modal */}
      {resolvingReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Resolve Report</h3>
            </div>
            <form onSubmit={handleResolveReport}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={resolutionData.status}
                    onChange={(e) => setResolutionData((prev) => ({ ...prev, status: e.target.value }))}
                    className="form-select"
                  >
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="DISMISSED">DISMISSED</option>
                    <option value="IN_REVIEW">IN_REVIEW</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Action Taken</label>
                  <input
                    type="text"
                    value={resolutionData.actionTaken}
                    onChange={(e) => setResolutionData((prev) => ({ ...prev, actionTaken: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Admin Notes</label>
                  <textarea
                    value={resolutionData.adminNotes}
                    onChange={(e) => setResolutionData((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setResolvingReport(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {creditAdjustment.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Adjust User Credits</h3>
            </div>
            <form onSubmit={handleAdjustCredits}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Credit Amount (+ for add, - for deduct)</label>
                  <input
                    type="number"
                    value={creditAdjustment.amount}
                    onChange={(e) => setCreditAdjustment((prev) => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input
                    type="text"
                    value={creditAdjustment.reason}
                    onChange={(e) => setCreditAdjustment((prev) => ({ ...prev, reason: e.target.value }))}
                    placeholder="e.g. Good conduct bonus or dispute resolution"
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setCreditAdjustment({ isOpen: false, userId: '', amount: 50, reason: '' })}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
