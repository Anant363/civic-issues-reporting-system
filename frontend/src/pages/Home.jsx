import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import IssueList from '../components/IssueList';
import Alert from '../components/Alert';
import { CATEGORIES, STATUSES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchIssues = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 9 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      const res = await issueService.getPublicIssues(params);
      setIssues(res.data.data);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(1);
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-civic-700 to-civic-900 rounded-3xl px-8 py-14 mb-10 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Your City. <br />
            Your Voice. 📣
          </h1>
          <p className="text-civic-100 text-lg mb-8 leading-relaxed">
            Report civic issues in your neighbourhood — from broken roads to
            overflowing garbage. Together we build a better city.
          </p>
          {isAuthenticated ? (
            <Link to="/report" className="inline-block bg-white text-civic-700 font-display font-bold py-3 px-7 rounded-xl hover:bg-civic-50 transition-all active:scale-95">
              + Report an Issue
            </Link>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <Link to="/register" className="inline-block bg-white text-civic-700 font-display font-bold py-3 px-7 rounded-xl hover:bg-civic-50 transition-all">
                Get Started
              </Link>
              <Link to="/login" className="inline-block bg-civic-600/60 border border-white/20 text-white font-semibold py-3 px-7 rounded-xl hover:bg-civic-600/80 transition-all">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-4 mb-8 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <p className="text-slate-700 font-semibold">
          <span className="text-2xl font-display text-civic-600">{pagination.total}</span>{' '}
          <span className="text-slate-500 font-normal">public issue{pagination.total !== 1 ? 's' : ''} reported</span>
        </p>
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            className="form-input w-auto text-sm py-2"
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="form-input w-auto text-sm py-2"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {(filters.category || filters.status) && (
            <button
              className="text-sm text-civic-600 font-medium hover:underline"
              onClick={() => setFilters({ category: '', status: '' })}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <Alert message={error} type="error" />}

      <IssueList
        issues={issues}
        loading={loading}
        emptyMessage="No approved issues found. Be the first to report one!"
        showReporter
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            className="btn-secondary py-2 px-4 text-sm"
            disabled={pagination.page === 1}
            onClick={() => fetchIssues(pagination.page - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            className="btn-secondary py-2 px-4 text-sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchIssues(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
