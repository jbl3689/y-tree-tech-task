interface ProgressSummaryProps {
  readyCount: number;
  totalCount: number;
}

export function ProgressSummary({ readyCount, totalCount }: ProgressSummaryProps) {
  const isReady = totalCount > 0 && readyCount === totalCount;

  return (
    <div className="progress-summary" role="status">
      <p><strong>{readyCount}</strong> of {totalCount} ready</p>
      <progress
        value={readyCount}
        max={Math.max(totalCount, 1)}
        aria-label="Accounts with current statements"
      />
      <span>{isReady ? "Ready to submit" : "Every account needs a current statement"}</span>
    </div>
  );
}
