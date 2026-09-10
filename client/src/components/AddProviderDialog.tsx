import { useId } from "react";
import type { Provider } from "../types";

interface AddProviderDialogProps {
  isOpen: boolean;
  /** Supply providers after searching and hiding existing accounts. */
  providers: Provider[];
  search: string;
  selectedProviderIds: number[];
  onSearchChange?: (search: string) => void;
  onToggleProvider?: (providerId: number) => void;
  onAdd?: (providerIds: number[]) => void;
  onClose?: () => void;
}

export function AddProviderDialog({
  isOpen, providers, search, selectedProviderIds,
  onSearchChange, onToggleProvider, onAdd, onClose,
}: AddProviderDialogProps) {
  const titleId = useId();
  const searchId = useId();

  // TODO: wire showModal(), Escape handling, and focus restoration.
  return (
    <dialog open={isOpen} className="dialog" aria-labelledby={titleId}>
      <h2 id={titleId}>Add your providers</h2>
      <p className="dialog-description">Choose one or more providers to add to your accounts.</p>
      <label className="field-label" htmlFor={searchId}>Search providers</label>
      <input
        id={searchId}
        type="search"
        placeholder="Search by name…"
        value={search}
        disabled={!onSearchChange}
        onChange={(event) => onSearchChange?.(event.target.value)}
      />
      <fieldset className="provider-options">
        <legend className="sr-only">Available providers</legend>
        {providers.map((provider) => (
          <label className="provider-option" key={provider.id}>
            <input
              type="checkbox"
              checked={selectedProviderIds.includes(provider.id)}
              disabled={!onToggleProvider}
              onChange={() => onToggleProvider?.(provider.id)}
            />
            <span>{provider.name}</span>
          </label>
        ))}
        {providers.length === 0 && <p className="muted">No providers to show.</p>}
      </fieldset>
      <div className="dialog-footer">
        <span className="selection-count">{selectedProviderIds.length} selected</span>
        <button className="button button--secondary" type="button" disabled={!onClose} onClick={onClose}>
          Cancel
        </button>
        <button
          className="button button--primary"
          type="button"
          disabled={!onAdd || selectedProviderIds.length === 0}
          onClick={() => onAdd?.(selectedProviderIds)}
        >
          Add providers
        </button>
      </div>
    </dialog>
  );
}
