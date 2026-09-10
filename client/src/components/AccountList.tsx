import type { AccountView } from "../types";
import { AccountRow } from "./AccountRow";

interface AccountListProps {
  accounts?: AccountView[];
  isFiltered?: boolean;
  onUpload?: (account: AccountView) => void;
  onRemove?: (accountId: number) => void;
}

export function AccountList({ accounts = [], isFiltered = false, onUpload, onRemove }: AccountListProps = {}) {
  if (accounts.length === 0) {
    return (
      <div className="empty-state" role="status">
        <h2>{isFiltered ? "No accounts with this status" : "Your accounts start here"}</h2>
        <p>{isFiltered ? "Choose another filter to see your accounts." : "Add a provider to get started."}</p>
      </div>
    );
  }

  return (
    <ul className="account-list" aria-label="Your accounts">
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} onUpload={onUpload} onRemove={onRemove} />
      ))}
    </ul>
  );
}
