import { useEffect, useId, useRef, useState } from "react";
import type { Statement } from "../types";

interface StatementDialogProps {
  isOpen: boolean;
  providerName: string;
  isReplacing?: boolean;
  onSave: (statement: Statement) => Promise<void>;
  onClose: () => void;
}

export function StatementDialog({
  isOpen,
  providerName,
  isReplacing = false,
  onSave,
  onClose,
}: StatementDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const titleId = useId();
  const fileNameId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;

    const previouslyFocused = document.activeElement;
    dialog.showModal();

    return () => {
      dialog.close();
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, [isOpen]);

  async function handleSave() {
    if (!file || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    const today = new Date();
    const uploadedAt = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    try {
      await onSave({ fileName: file.name, uploadedAt });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save statement");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!isSaving) onClose();
      }}
    >
      <h2 id={titleId}>{isReplacing ? "Replace" : "Upload"} statement</h2>
      <p className="dialog-description">
        Statement details for {providerName}.
      </p>
      <div className="form-field">
        <label className="field-label" htmlFor={fileNameId}>
          Statement file
        </label>
        <input
          id={fileNameId}
          type="file"
          disabled={isSaving}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setFile(file ?? null);
            setSaveError(null);
          }}
        />
      </div>
      {saveError && <p role="alert">{saveError}</p>}
      <div className="dialog-footer">
        <button
          className="button button--secondary"
          type="button"
          disabled={isSaving}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="button button--primary"
          type="button"
          disabled={!file || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : "Save statement"}
        </button>
      </div>
    </dialog>
  );
}
