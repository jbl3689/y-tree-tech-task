import type { Account } from "../types";

export async function getAccounts(signal?: AbortSignal): Promise<Account[]> {
  const response = await fetch("/api/accounts", { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch accounts (${response.status})`);
  }

  return response.json();
}
