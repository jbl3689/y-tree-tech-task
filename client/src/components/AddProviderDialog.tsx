import { useEffect, useId, useRef, useState } from "react";
import { getProviders } from "../api/providers";
import type { Provider } from "../types";

interface AddProviderDialogProps {
  isOpen: boolean;
  onAdd: (providerId: number) => Promise<void>;
  onClose: () => void;
}

type ProvidersState =
  | { status: "loading" }
  | { status: "ready"; providers: Provider[] }
  | { status: "error"; message: string };

export function AddProviderDialog({ isOpen, onAdd, onClose }: AddProviderDialogProps) {
  const [providerState, setProviderState] = useState<ProvidersState>({ status: "loading" });
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const selectId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previouslyFocused = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    // The backend excludes existing accounts; fetch again whenever this dialog opens.
    getProviders(controller.signal).then((providers) => {
      if (!controller.signal.aborted) setProviderState({ status: "ready", providers });
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setProviderState({
          status: "error",
          message: error instanceof Error ? error.message : "Failed to load providers",
        });
      }
    });
    return () => controller.abort();
  }, [isOpen]);

  async function handleAdd() {
    if (!selectedProviderId || isAdding) return;
    setIsAdding(true);
    setSaveError(null);
    try {
      await onAdd(Number(selectedProviderId));
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to add provider");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!isAdding) onClose();
      }}
    >
      <form onSubmit={(event) => { event.preventDefault(); void handleAdd(); }}>
        <h2 id={titleId}>Add a provider</h2>
        <p className="dialog-description">Choose a provider to add to your accounts.</p>
        {providerState.status === "loading" && <p role="status">Loading providers…</p>}
        {providerState.status === "error" && <p role="alert">{providerState.message}</p>}
        {providerState.status === "ready" && (
          providerState.providers.length === 0
            ? <p className="muted">All available providers have already been added.</p>
            : <>
                <label className="field-label" htmlFor={selectId}>Provider</label>
                <select
                  id={selectId}
                  value={selectedProviderId}
                  required
                  disabled={isAdding}
                  onChange={(event) => {
                    setSelectedProviderId(event.target.value);
                    setSaveError(null);
                  }}
                >
                  <option value="" disabled>Select a provider</option>
                  {providerState.providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.name}</option>
                  ))}
                </select>
              </>
        )}
        {saveError && <p role="alert">{saveError}</p>}
        <div className="dialog-footer">
          <button className="button button--secondary" type="button" disabled={isAdding} onClick={onClose}>
            Cancel
          </button>
          <button className="button button--primary" type="submit" disabled={!selectedProviderId || isAdding}>
            {isAdding ? "Adding…" : "Add provider"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
