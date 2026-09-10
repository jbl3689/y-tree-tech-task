import { useEffect, useState } from "react";
import { getAccounts } from "../api/accounts";
import { getProviders } from "../api/providers";
import { toAccountViews } from "../utils/accounts";
import type { AccountView } from "../types";

type AccountsState =
  | { status: "loading" }
  | { status: "success"; accounts: AccountView[] }
  | { status: "error"; error: string };

export function useAccounts() {
  const [state, setState] = useState<AccountsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function loadAccounts() {
      try {
        const [accounts, providers] = await Promise.all([
          getAccounts(controller.signal),
          getProviders(controller.signal),
        ]);

        if (!controller.signal.aborted) {
          setState({ status: "success", accounts: toAccountViews(accounts, providers) });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            error: error instanceof Error ? error.message : "Failed to load accounts",
          });
        }
      }
    }

    void loadAccounts();
    return () => controller.abort();
  }, []);

  return state;
}
