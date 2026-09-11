import { expect, it } from "vitest";
import { toAccountViews } from "./accounts";

it.each([
  { today: "2026-05-31", outdated: "2026-02-27", cutoff: "2026-02-28" },
  { today: "2024-05-31", outdated: "2024-02-28", cutoff: "2024-02-29" },
  { today: "2026-01-15", outdated: "2025-10-14", cutoff: "2025-10-15" },
])("uses three calendar months as of $today, including the cutoff day", ({ today, outdated, cutoff }) => {
  const accounts = [null, outdated, cutoff, today].map((date, index) => ({
    id: index + 1,
    providerId: index + 1,
    statement: date ? { fileName: "statement.pdf", uploadedAt: date } : null,
  }));

  expect(toAccountViews(accounts, [], new Date(`${today}T12:00:00`)).map((account) => account.status))
    .toEqual(["MISSING", "OUTDATED", "UPLOADED", "UPLOADED"]);
});
