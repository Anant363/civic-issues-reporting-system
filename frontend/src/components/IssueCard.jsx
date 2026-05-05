import { CATEGORY_ICONS, STATUS_BADGE } from '../utils/constants';

export default function IssueCard({ issue, showReporter = false, onClick }) {
  const icon = CATEGORY_ICONS[issue.category] || '📋';
  const badgeClass = STATUS_BADGE[issue.status] || 'badge-waiting';

  const reporterName = issue.isAnonymous
    ? 'Anonymous'
    : issue.reporterName || issue.reportedBy?.name || 'Unknown';

  const formattedDate = new Date(issue.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className={`card transition-all duration-200 animate-slide-up ${
        onClick
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]'
          : 'hover:shadow-md'
      }`}
    >
      {/* Optional thumbnail */}
      {issue.imageUrl && (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-slate-100">
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-display font-semibold text-slate-800 leading-tight">
              {issue.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{issue.category}</p>
          </div>
        </div>
        <span className={badgeClass}>{issue.status}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
        {issue.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{issue.location}</span>
        </div>
        <div className="flex items-center gap-3">
          {showReporter && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {reporterName}
            </span>
          )}
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Click hint */}
      {onClick && (
        <p className="text-xs text-civic-400 mt-2 text-right font-medium">
          Tap to view details →
        </p>
      )}
    </div>
  );
}