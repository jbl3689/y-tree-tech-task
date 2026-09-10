import { useId } from "react";
import type { StatusFilterValue } from "../types";

interface StatusFilterProps {
  value: StatusFilterValue;
  onChange?: (value: StatusFilterValue) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  const id = useId();

  return (
    <div className="status-filter">
      <label htmlFor={id}>Filter</label>
      <select
        id={id}
        value={value}
        disabled={!onChange}
        onChange={(event) => onChange?.(event.target.value as StatusFilterValue)}
      >
        <option value="ALL">All statuses</option>
        <option value="MISSING">Missing</option>
        <option value="UPLOADED">Uploaded</option>
        <option value="OUTDATED">Outdated</option>
      </select>
    </div>
  );
}
