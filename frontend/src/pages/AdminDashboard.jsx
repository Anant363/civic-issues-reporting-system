import { useState, useEffect, useCallback } from 'react';
import { issueService } from '../services/issueService';
import Alert from '../components/Alert';
import Spinner from '../components/Spinner';
import { CATEGORY_ICONS, STATUSES } from '../utils/constants';

const TAB = { PENDING: 'pending', ALL: 'all', STATS: 'stats' };

export default function AdminDashboard() {
  const [tab, setTab] = useState(TAB.PENDING);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [rejectModal, setRejectModal] = useState(null); // { id, reason }
  const [statusFilter, setStatusFilter] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (tab === TAB.PENDING) {
        params.isApproved = 'false';
        params.isRejected = 'false';
      }
      if (statusFilter) params.status = statusFilter;
      const res = await issueService.getAllIssuesAdmin({ ...params, limit: 50 });
      setIssues(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [tab, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await issueService.getAdminStats();
      setStats(res.data.data);
    } catch {
      /* non-critical */
    }
  }, []);

  useEffect(() => {
    if (tab === TAB.STATS) {
      fetchStats();
    } else {
      fetchIssues();
    }
  }, [tab, fetchIssues, fetchStats]);

  const handleApprove = async (id) => {
    setActionLoading(id + '_approve');
    try {
      await issueService.approveIssue(id);
      showSuccess('Issue approved ✅');
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id + '_reject');
    try {
      await issueService.rejectIssue(rejectModal.id, rejectModal.reason);
      showSuccess('Issue rejected');
      setRejectModal(null);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id + '_status');
    try {
      await issueService.updateIssueStatus(id, status);
      showSuccess(`Status updated to "${status}"`);
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this issue?')) return;
    setActionLoading(id + '_delete');
    try {
      await issueService.deleteIssue(id);
      showSuccess('Issue deleted');
      fetchIssues();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-800">
          ⚙️ Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1">
          Review, approve, reject, and track all civic issue reports.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4">
          <Alert message={error} type="error" />
        </div>
      )}
      {successMsg && (
        <div className="mb-4">
          <Alert message={successMsg} type="success" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { key: TAB.PENDING, label: '🕐 Pending Review' },
          { key: TAB.ALL, label: '📋 All Issues' },
          { key: TAB.STATS, label: '📊 Statistics' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setTab(key); setStatusFilter(''); }}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              tab === key
                ? 'border-civic-600 text-civic-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Statistics Tab ── */}
      {tab === TAB.STATS && (
        <div className="animate-fade-in">
          {!stats ? (
            <Spinner />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                  { label: 'Total', value: stats.total, color: 'text-slate-700', bg: 'bg-white' },
                  { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Rejected', value: stats.rejected, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Resolved', value: stats.resolved, color: 'text-teal-600', bg: 'bg-teal-50' },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-2xl border border-gray-100 p-4 text-center shadow-sm ${bg}`}>
                    <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              {stats.categoryStats.length > 0 && (
                <div className="card">
                  <h2 className="font-display font-semibold text-slate-700 mb-4">Issues by Category</h2>
                  <div className="space-y-3">
                    {stats.categoryStats.map(({ _id, count }) => {
                      const pct = Math.round((count / stats.approved) * 100) || 0;
                      return (
                        <div key={_id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="flex items-center gap-1.5">
                              <span>{CATEGORY_ICONS[_id] || '📋'}</span>
                              <span className="text-slate-700">{_id}</span>
                            </span>
                            <span className="font-semibold text-slate-600">{count}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-civic-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Issues Tab (Pending & All) ── */}
      {(tab === TAB.PENDING || tab === TAB.ALL) && (
        <>
          {tab === TAB.ALL && (
            <div className="flex gap-3 mb-5 flex-wrap">
              <select
                className="form-input w-auto text-sm py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {loading ? (
            <Spinner />
          ) : issues.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-slate-500 font-medium">
                {tab === TAB.PENDING ? 'No issues awaiting review!' : 'No issues found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <AdminIssueRow
                  key={issue._id}
                  issue={issue}
                  actionLoading={actionLoading}
                  onApprove={handleApprove}
                  onReject={(id) => setRejectModal({ id, reason: '' })}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md animate-slide-up">
            <h2 className="font-display font-bold text-xl text-slate-800 mb-1">
              Reject Issue
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Provide a reason for rejection (optional).
            </p>
            <textarea
              rows={3}
              className="form-input resize-none mb-4"
              placeholder="e.g., Duplicate report, insufficient detail…"
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="btn-danger flex-1"
                disabled={!!actionLoading}
                onClick={handleReject}
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-component: single admin issue row ────────────────────────────────────
function AdminIssueRow({ issue, actionLoading, onApprove, onReject, onStatusUpdate, onDelete }) {
  const icon = CATEGORY_ICONS[issue.category] || '📋';
  const reporter = issue.isAnonymous
    ? 'Anonymous'
    : issue.reportedBy?.name || 'Unknown';

  const approvalBadge = issue.isRejected
    ? <span className="badge-rejected">Rejected</span>
    : issue.isApproved
    ? <span className="badge-resolved">Approved</span>
    : <span className="badge-waiting">Awaiting</span>;

  return (
    <div className="card animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Icon + info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl mt-0.5">{icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800">{issue.title}</h3>
              {issue.isAnonymous && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  Anon
                </span>
              )}
              {approvalBadge}
              {issue.isApproved && (
                <span className={
                  issue.status === 'Resolved' ? 'badge-resolved' :
                  issue.status === 'In Progress' ? 'badge-progress' :
                  'badge-pending'
                }>
                  {issue.status}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 line-clamp-2 mb-1">
              {issue.description}
            </p>
            <p className="text-xs text-slate-400">
              {issue.category} · {issue.location} · by {reporter} ·{' '}
              {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </p>
            {issue.isRejected && issue.rejectionReason && (
              <p className="text-xs text-red-500 mt-1">
                Reason: {issue.rejectionReason}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap sm:flex-col gap-2 sm:w-44 flex-shrink-0">
          {/* Approve / Re-approve */}
          {!issue.isApproved && (
            <button
              className="btn-success text-xs py-1.5 px-3"
              disabled={!!actionLoading}
              onClick={() => onApprove(issue._id)}
            >
              {actionLoading === issue._id + '_approve' ? '…' : '✅ Approve'}
            </button>
          )}

          {/* Reject */}
          {!issue.isRejected && (
            <button
              className="btn-danger text-xs py-1.5 px-3"
              disabled={!!actionLoading}
              onClick={() => onReject(issue._id)}
            >
              ❌ Reject
            </button>
          )}

          {/* Re-approve a rejected issue */}
          {issue.isRejected && (
            <button
              className="btn-success text-xs py-1.5 px-3"
              disabled={!!actionLoading}
              onClick={() => onApprove(issue._id)}
            >
              ↩️ Re-approve
            </button>
          )}

          {/* Status update — only for approved issues */}
          {issue.isApproved && (
            <select
              className="form-input text-xs py-1.5"
              value={issue.status}
              disabled={!!actionLoading}
              onChange={(e) => onStatusUpdate(issue._id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}

          {/* Delete */}
          <button
            className="text-xs text-red-400 hover:text-red-600 font-semibold py-1.5 px-3 border border-red-100 rounded-xl hover:border-red-300 transition-colors"
            disabled={!!actionLoading}
            onClick={() => onDelete(issue._id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}
