import { useState } from "react";
import "./App.css";
import { AccountActions } from "./components/AccountActions";
import { AccountList } from "./components/AccountList";
import { ProgressSummary } from "./components/ProgressSummary";
import { StatementDialog } from "./components/StatementDialog";
import { StatusFilter } from "./components/StatusFilter";
import { useAccounts } from "./hooks/useAccounts";
import type { AccountView, StatusFilterValue } from "./types";
import { AddProviderDialog } from "./components/AddProviderDialog";

type ActiveModal =
  | { type: "statement"; account: AccountView }
  | { type: "provider" }
  | null;

function App() {
  const accountState = useAccounts();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("ALL");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  function handleOpenDialog(account: AccountView) {
    setActiveModal({
      type: "statement",
      account,
    });
  }

  switch (accountState.status) {
    case "submitted":
      return (
        <main className="accounts-card">
          <p role="status">Submission complete</p>
        </main>
      );
    case "loading":
      return (
        <div className="loading-state" role="status">
          Loading accounts...
        </div>
      );
    case "error":
      return (
        <div className="error-state" role="alert">
          Error: {accountState.error}
        </div>
      );
  }

  const accounts = accountState.accounts;
  const readyCount = accounts.filter(
    (account) => account.status === "UPLOADED",
  ).length;
  const canSubmit = accounts.length > 0 && readyCount === accounts.length;
  const visibleAccounts =
    statusFilter === "ALL"
      ? accounts
      : accounts.filter((account) => account.status === statusFilter);

  return (
    <main className="accounts-card" aria-labelledby="accounts-title">
      <header className="accounts-header">
        <div>
          <h1 id="accounts-title">Connect your accounts</h1>
          <p className="intro">
            Add a recent statement for each of your providers.
          </p>
        </div>
        <ProgressSummary readyCount={readyCount} totalCount={accounts.length} />
      </header>

      <div className="accounts-toolbar">
        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
      </div>

      <AccountList
        accounts={visibleAccounts}
        isFiltered={statusFilter !== "ALL"}
        onUpload={accountState.isSubmitting ? undefined : handleOpenDialog}
        onRemove={
          accountState.isSubmitting ? undefined : accountState.removeAccount
        }
      />
      <AccountActions
        canSubmit={canSubmit}
        isSubmitting={accountState.isSubmitting}
        onAddProvider={() => setActiveModal({ type: "provider" })}
        onSubmit={accountState.submit}
      />
      {accountState.submitError && (
        <p role="alert">{accountState.submitError}</p>
      )}

      {activeModal?.type === "statement" && (
        <StatementDialog
          isOpen
          providerName={activeModal.account.providerName}
          isReplacing={activeModal.account.statement !== null}
          onSave={(statement) =>
            accountState.saveStatement(activeModal.account.id, statement)
          }
          onClose={() => setActiveModal(null)}
        />
      )}
      {activeModal?.type === "provider" && (
        <AddProviderDialog
          isOpen
          onAdd={async (providerId) => {
            await accountState.addProvider(providerId);
            setStatusFilter("ALL");
          }}
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  );
}

export default App;
