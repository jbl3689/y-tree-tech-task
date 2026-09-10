import type { Account, AccountView, Provider } from "../types";

export function toAccountViews(
  accounts: Account[],
  providers: Provider[],
  today = new Date(),
): AccountView[] {
  const providerNames = new Map(providers.map((provider) => [provider.id, provider.name]));

  // Clamp to the last day of the target month when subtracting three calendar months.
  const cutoff = new Date(today.getFullYear(), today.getMonth() - 3, 1);
  const lastDay = new Date(cutoff.getFullYear(), cutoff.getMonth() + 1, 0).getDate();
  cutoff.setDate(Math.min(today.getDate(), lastDay));
  const cutoffDate = [
    cutoff.getFullYear(),
    String(cutoff.getMonth() + 1).padStart(2, "0"),
    String(cutoff.getDate()).padStart(2, "0"),
  ].join("-");

  return accounts.map((account) => ({
    ...account,
    providerName: providerNames.get(account.providerId) ?? `Provider ${account.providerId}`,
    // The API uses ISO date-only strings, which can be compared without timezone conversion.
    status: !account.statement
      ? "MISSING"
      : account.statement.uploadedAt < cutoffDate
        ? "OUTDATED"
        : "UPLOADED",
  }));
}
