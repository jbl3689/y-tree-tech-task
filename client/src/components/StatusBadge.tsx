import type { AccountStatus } from "../types";

const statusLabels: Record<AccountStatus, string> = {
  MISSING: "Missing",
  UPLOADED: "Uploaded",
  OUTDATED: "Outdated",
};

interface StatusBadgeProps {
  status: AccountStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabels[status]}
    </span>
  );
}
