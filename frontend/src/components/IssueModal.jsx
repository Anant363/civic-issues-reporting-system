import { useEffect } from 'react';
import { CATEGORY_ICONS } from '../utils/constants';

const STATUS_STYLES = {
  Pending: 'badge-pending',
  'In Progress': 'badge-progress',
  Resolved: 'badge-resolved',
};

export default function IssueModal({ issue, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!issue) return null;

  const icon = CATEGORY_ICONS[issue.category] || '📋';
  const badgeClass = STATUS_STYLES[issue.status] || 'badge-waiting';

  const reporterName = issue.isAnonymous
    ? 'Anonymous'
    : issue.reporterName || issue.reportedBy?.name || 'Unknown';

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Optional image */}
        {issue.imageUrl && (
          <div className="w-full h-52 overflow-hidden rounded-t-2xl bg-slate-100">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.parentElement.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="p-6">
          {/* Category + status row */}
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <span className="text-xl">{icon}</span>
              {issue.category}
            </span>
            <span className={badgeClass}>{issue.status}</span>
          </div>

          {/* Title */}
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-3 leading-snug">
            {issue.title}
          </h2>

          {/* Description */}
          <p className="text-slate-600 text-sm leading-relaxed mb-5">
            {issue.description}
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <MetaItem icon="📍" label="Location" value={issue.location} />
            <MetaItem
              icon="👤"
              label="Reported by"
              value={
                <span className="flex items-center gap-1.5">
                  {reporterName}
                  {issue.isAnonymous && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                      Anon
                    </span>
                  )}
                </span>
              }
            />
            <MetaItem icon="📅" label="Reported on" value={formattedDate} />
            <MetaItem
              icon="🔖"
              label="Approval"
              value={
                issue.isRejected ? (
                  <span className="text-red-500 font-semibold">Rejected</span>
                ) : issue.isApproved ? (
                  <span className="text-emerald-600 font-semibold">Approved</span>
                ) : (
                  <span className="text-amber-600 font-semibold">Under Review</span>
                )
              }
            />
          </div>

          {/* Rejection reason */}
          {issue.isRejected && issue.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              <span className="font-semibold">Rejection reason:</span>{' '}
              {issue.rejectionReason}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="bg-slate-50 rounded-xl px-3 py-2.5">
      <p className="text-xs text-slate-400 mb-0.5">{icon} {label}</p>
      <p className="text-slate-700 font-medium text-sm">{value}</p>
    </div>
  );
}