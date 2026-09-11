import type { Account } from "../types";

export async function getAccounts(signal?: AbortSignal): Promise<Account[]> {
  const response = await fetch("/api/accounts", { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch accounts (${response.status})`);
  }

  return response.json();
}

export async function addAccount(providerId: number): Promise<Account> {
  const response = await fetch("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add provider (${response.status})`);
  }

  return response.json();
}
