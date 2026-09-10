interface AccountActionsProps {
  canSubmit: boolean;
  isSubmitting?: boolean;
  onAddProvider?: () => void;
  onSubmit?: () => void;
}

export function AccountActions({
  canSubmit,
  isSubmitting = false,
  onAddProvider,
  onSubmit,
}: AccountActionsProps) {
  return (
    <footer className="account-footer">
      <button className="button button--add" type="button" disabled={!onAddProvider} onClick={onAddProvider}>
        <span aria-hidden="true">+</span> Add provider
      </button>
      <div className="submit-group">
        <p className="muted">
          {canSubmit ? "Your accounts are ready." : "Add a current statement for every account to continue."}
        </p>
        <button
          className="button button--primary"
          type="button"
          disabled={!canSubmit || isSubmitting || !onSubmit}
          onClick={onSubmit}
        >
          {isSubmitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </footer>
  );
}
