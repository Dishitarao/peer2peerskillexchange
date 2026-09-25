import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallet, fetchTransactions, selectWallet } from '../redux/slices/walletSlice';
import { selectAuth } from '../redux/slices/authSlice';
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  ShieldAlert,
  RefreshCw,
  Coins
} from 'lucide-react';

const WalletPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const { wallet, transactions, total, page, totalPages, loading } = useSelector(selectWallet);

  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadWalletData = () => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions({ type: typeFilter, page: currentPage, limit: 10 }));
  };

  useEffect(() => {
    loadWalletData();
  }, [dispatch, typeFilter, currentPage]);

  const getTxTypeBadge = (type) => {
    switch (type) {
      case 'SESSION_CREDIT_EARNED':
        return <span className="badge badge-success">Earned (Teaching)</span>;
      case 'SESSION_CREDIT_SPENT':
        return <span className="badge badge-danger">Spent (Learning)</span>;
      case 'INITIAL_BONUS':
        return <span className="badge badge-primary">Welcome Bonus</span>;
      case 'ADMIN_ADJUSTMENT':
        return <span className="badge badge-warning">Admin Adjustment</span>;
      case 'REFUND':
        return <span className="badge badge-neutral">Refund</span>;
      default:
        return <span className="badge badge-neutral">{type}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Credit Wallet & Transactions</h1>
          <p className="page-subtitle">
            Track your virtual credits earned by mentoring and spent on learning
          </p>
        </div>

        <button type="button" onClick={loadWalletData} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Wallet Balance Cards Grid */}
      <div className="grid-cols-3">
        {/* Current Balance */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-hover) 100%)',
            border: '2px solid var(--accent-emerald)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Available Balance
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Coins size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {wallet?.currentBalance ?? user?.walletBalance ?? 100}
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
              credits
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Usable to book any mentor session across the platform
          </p>
        </div>

        {/* Total Earned */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Credits Earned
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald-light)',
                color: 'var(--accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            +{wallet?.totalEarned ?? 0}
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
              credits
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            From confirmed peer mentoring sessions
          </p>
        </div>

        {/* Total Spent */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Credits Spent
            </span>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--accent-rose-light)',
                color: 'var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            -{wallet?.totalSpent ?? 0}
            <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>
              credits
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            On completed 1-on-1 tutoring sessions
          </p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Transaction History</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Complete audit log of credit additions, session exchanges, and deductions
            </p>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
          >
            <option value="">All Transactions</option>
            <option value="INITIAL_BONUS">Welcome Bonus</option>
            <option value="SESSION_CREDIT_EARNED">Teaching Earnings</option>
            <option value="SESSION_CREDIT_SPENT">Learning Expenses</option>
            <option value="ADMIN_ADJUSTMENT">Admin Adjustments</option>
          </select>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : transactions && transactions.length > 0 ? (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Date & Time</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>{getTxTypeBadge(tx.type)}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tx.description}</div>
                        {tx.sessionId && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Session ID: {tx.sessionId._id || tx.sessionId}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(tx.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                          }}
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {tx.balanceAfter} credits
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ padding: '2.5rem 0' }}>
            <Coins size={36} className="empty-state-icon" style={{ margin: '0 auto' }} />
            <h4>No Transactions Yet</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Complete a session or register a new account to see credit exchanges here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
