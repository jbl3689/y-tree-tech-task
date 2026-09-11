import { useState } from "react";
import type { AccountView } from "../types";
import { StatusBadge } from "./StatusBadge";

interface AccountRowProps {
  account: AccountView;
  onUpload?: (account: AccountView) => void;
  onRemove?: (accountId: number) => Promise<void>;
}

export function AccountRow({ account, onUpload, onRemove }: AccountRowProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const action = account.statement ? "Replace" : "Upload";

  async function handleRemove() {
    if (!onRemove || isRemoving) return;

    setIsRemoving(true);
    setRemoveError(null);
    try {
      await onRemove(account.id);
    } catch (error) {
      setRemoveError(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsRemoving(false);
    }
  }

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
              Uploaded{" "}
              <time dateTime={account.statement.uploadedAt}>
                {account.statement.uploadedAt}
              </time>
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
          disabled={!onUpload || isRemoving}
          onClick={() => onUpload?.(account)}
          aria-label={`${action} statement for ${account.providerName}`}
        >
          {action}
        </button>
        <button
          className="icon-button remove-button"
          type="button"
          disabled={!onRemove || isRemoving}
          onClick={handleRemove}
          aria-label={`${isRemoving ? "Removing" : "Remove"} ${account.providerName}`}
          title={`${isRemoving ? "Removing" : "Remove"} ${account.providerName}`}
          aria-busy={isRemoving}
        >
          <span aria-hidden="true">{isRemoving ? "…" : "×"}</span>
        </button>
      </div>
      {removeError && <p className="account-error" role="alert">{removeError}</p>}
    </li>
  );
}
