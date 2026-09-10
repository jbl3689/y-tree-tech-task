# Account onboarding component scaffold

Run `npm install` and `npm run dev` from this directory.
Use `npm run build` for TypeScript/build checks and `npm run lint` for lint checks.

The components in `src/components` are presentational shells with typed props.
They do not fetch data or own application state. Optional action callbacks keep
controls disabled until wired. `App.tsx` and `src/api/accounts.ts` are the integration
points; their current work has been left in place.

| Component | Responsibility / main props |
| --- | --- |
| `AccountList` | Accounts or an empty state; `accounts`, `isFiltered`, `onUpload`, `onRemove`. |
| `AccountRow` | Provider, status, statement details and actions; `account`, `onUpload`, `onRemove`. |
| `StatusBadge` | Label and colour for a supplied `status`. |
| `ProgressSummary` | Readiness count and progress bar; `readyCount`, `totalCount`. |
| `StatusFilter` | Controlled status selector; `value`, `onChange`. |
| `AddProviderDialog` | Search and multiple selection shell; `isOpen`, `providers`, `search`, `selectedProviderIds`, and callbacks. |
| `StatementDialog` | Controlled filename/date fields; `isOpen`, `providerName`, `statement`, and callbacks. |
| `AccountActions` | Add-provider and submit controls; `canSubmit`, `isSubmitting`, `onAddProvider`, `onSubmit`. |

Shared types live in `src/types/index.ts`. `Account` matches the current Java model;
`AccountView` adds the provider name and status needed by the UI.

Example composition inside your app (after supplying these values):

```tsx
<section className="accounts-card">
  <header className="accounts-header">
    <h1>Connect your accounts</h1>
    <ProgressSummary readyCount={readyCount} totalCount={accounts.length} />
  </header>
  <div className="accounts-toolbar">
    <StatusFilter value={filter} onChange={setFilter} />
  </div>
  <AccountList
    accounts={visibleAccounts}
    isFiltered={filter !== "ALL"}
    onUpload={openStatementDialog}
    onRemove={removeAccount}
  />
  <AccountActions
    canSubmit={canSubmit}
    onAddProvider={openProviderDialog}
    onSubmit={submitAccounts}
  />
</section>
```

Next integration work from `PLAN.md`: fetch accounts/providers, join provider names,
implement filtering and selection, wire add/remove/statement/submit callbacks, and
add loading/error/success feedback. Calculate readiness across all accounts.
The server must derive status and independently validate submission.

The dialog shells also need `showModal()`, Escape handling, focus restoration and
form validation when their behaviour is implemented. No dialog is opened by default.
The existing Vite proxy forwards `/api` to `http://localhost:8080`.
