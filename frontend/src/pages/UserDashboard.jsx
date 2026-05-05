import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import IssueModal from '../components/IssueModal';
import { CATEGORY_ICONS } from '../utils/constants';

const statusStyles = {
  Pending: 'badge-pending',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
};

const approvalLabel = (issue) => {
  if (issue.isRejected) return { label: 'Rejected', cls: 'badge-rejected' };
  if (issue.isApproved) return { label: 'Approved', cls: 'badge-resolved' };
  return { label: 'Awaiting Review', cls: 'badge-waiting' };
};

export default function UserDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
        const res = await issueService.getMyIssues();
        setIssues(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load your issues');
      } finally {
        setLoading(false);
      }
    };
    fetchMyIssues();
  }, []);

  const filtered = issues.filter((issue) => {
    if (filter === 'approved') return issue.isApproved;
    if (filter === 'pending') return !issue.isApproved && !issue.isRejected;
    if (filter === 'rejected') return issue.isRejected;
    return true;
  });

  const counts = {
    total: issues.length,
    approved: issues.filter((i) => i.isApproved).length,
    pending: issues.filter((i) => !i.isApproved && !i.isRejected).length,
    rejected: issues.filter((i) => i.isRejected).length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">
            My Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Hello, <span className="font-semibold text-slate-700">{user?.name}</span>! Here are all your reported issues.
          </p>
        </div>
        <Link to="/report" className="btn-primary whitespace-nowrap">
          + Report Issue
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: counts.total, color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Approved', value: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Pending', value: counts.pending, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Rejected', value: counts.rejected, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {error && <Alert message={error} type="error" />}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', 'approved', 'pending', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-civic-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-slate-600 hover:border-civic-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Issue list */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-500 font-medium">No issues in this category yet.</p>
          <Link to="/report" className="btn-primary inline-block mt-4">
            Report your first issue
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const { label, cls } = approvalLabel(issue);
            return (
              <div
                key={issue._id}
                onClick={() => setSelectedIssue(issue)}
                className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 active:scale-[0.99]"
              >
                <span className="text-2xl">{CATEGORY_ICONS[issue.category] || '📋'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 truncate">{issue.title}</h3>
                    {issue.isAnonymous && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {issue.category} · {issue.location} ·{' '}
                    {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  {issue.isRejected && issue.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">
                      Reason: {issue.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cls}>{label}</span>
                  {issue.isApproved && (
                    <span className={`${statusStyles[issue.status] || 'badge-pending'}`}>
                      {issue.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedIssue && (
        <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
}