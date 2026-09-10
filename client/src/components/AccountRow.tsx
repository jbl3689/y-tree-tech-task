import type { AccountView } from "../types";
import { StatusBadge } from "./StatusBadge";

interface AccountRowProps {
  account: AccountView;
  onUpload?: (account: AccountView) => void;
  onRemove?: (accountId: number) => void;
}

export function AccountRow({ account, onUpload, onRemove }: AccountRowProps) {
  const action = account.statement ? "Replace" : "Upload";

  return (
    <li className="account-row">
      <div className="account-provider">
        <span className="provider-monogram" aria-hidden="true">
          {account.providerName.slice(0, 1)}
        </span>
        <h2>{account.providerName}</h2>
      </div>
      <StatusBadge status={account.status} />
      <div className="account-statement">
        {account.statement ? (
          <>
            <span className="statement-name" title={account.statement.fileName}>
              {account.statement.fileName}
            </span>
            <span className="statement-date">
              Uploaded <time dateTime={account.statement.uploadedAt}>{account.statement.uploadedAt}</time>
            </span>
          </>
        ) : (
          <span className="statement-empty">No statement added</span>
        )}
      </div>
      <div className="account-actions">
        <button
          className="button button--secondary"
          type="button"
          disabled={!onUpload}
          onClick={() => onUpload?.(account)}
          aria-label={`${action} statement for ${account.providerName}`}
        >
          {action}
        </button>
        <button
          className="icon-button remove-button"
          type="button"
          disabled={!onRemove}
          onClick={() => onRemove?.(account.id)}
          aria-label={`Remove ${account.providerName}`}
          title={`Remove ${account.providerName}`}
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </li>
  );
}
