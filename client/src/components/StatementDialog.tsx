import { useId } from "react";
import type { Statement } from "../types";

interface StatementDialogProps {
  isOpen: boolean;
  providerName: string;
  statement: Statement;
  isReplacing?: boolean;
  onChange?: (statement: Statement) => void;
  onSave?: (statement: Statement) => void;
  onClose?: () => void;
}

export function StatementDialog({
  isOpen, providerName, statement, isReplacing = false,
  onChange, onSave, onClose,
}: StatementDialogProps) {
  const titleId = useId();
  const fileNameId = useId();
  const dateId = useId();

  // TODO: wire modal focus handling and validate fields before saving.
  return (
    <dialog open={isOpen} className="dialog" aria-labelledby={titleId}>
      <h2 id={titleId}>{isReplacing ? "Replace" : "Upload"} statement</h2>
      <p className="dialog-description">Statement details for {providerName}.</p>
      <div className="form-field">
        <label className="field-label" htmlFor={fileNameId}>Statement filename</label>
        <input
          id={fileNameId}
          type="text"
          placeholder="statement.pdf"
          value={statement.fileName}
          disabled={!onChange}
          onChange={(event) => onChange?.({ ...statement, fileName: event.target.value })}
        />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor={dateId}>Upload date</label>
        <input
          id={dateId}
          type="date"
          value={statement.uploadedAt}
          disabled={!onChange}
          onChange={(event) => onChange?.({ ...statement, uploadedAt: event.target.value })}
        />
      </div>
      <div className="dialog-footer">
        <button className="button button--secondary" type="button" disabled={!onClose} onClick={onClose}>
          Cancel
        </button>
        <button
          className="button button--primary"
          type="button"
          disabled={!onSave}
          onClick={() => onSave?.(statement)}
        >
          Save statement
        </button>
      </div>
    </dialog>
  );
}
