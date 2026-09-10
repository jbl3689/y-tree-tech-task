import type { Provider } from "../types";

export async function getProviders(signal?: AbortSignal): Promise<Provider[]> {
  const response = await fetch("/api/providers", { signal });

  if (!response.ok) {
    throw new Error(`Failed to fetch providers (${response.status})`);
  }

  return response.json();
}
