import { useState } from 'react';
import IssueCard from './IssueCard';
import IssueModal from './IssueModal';
import Spinner from './Spinner';

export default function IssueList({
  issues = [],
  loading = false,
  emptyMessage = 'No issues found.',
  showReporter = false,
}) {
  const [selectedIssue, setSelectedIssue] = useState(null);

  if (loading) return <Spinner />;

  if (issues.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🗂️</p>
        <p className="text-slate-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <IssueCard
            key={issue._id}
            issue={issue}
            showReporter={showReporter}
            onClick={() => setSelectedIssue(issue)}
          />
        ))}
      </div>

      {selectedIssue && (
        <IssueModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </>
  );
}