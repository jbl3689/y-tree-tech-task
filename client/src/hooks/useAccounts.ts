import { useEffect, useState } from "react";
import { addAccount, getAccounts } from "../api/accounts";
import { toAccountViews } from "../utils/accounts";
import type { Account, AccountView, Statement } from "../types";

type AccountsState =
  | { status: "loading" }
  | { status: "success"; accounts: AccountView[] }
  | { status: "submitted" }
  | { status: "error"; error: string };

export function useAccounts() {
  const [state, setState] = useState<AccountsState>({ status: "loading" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    // Fetch all accounts
    async function loadAccounts() {
      try {
        const isSubmitted = await fetch("/api/accounts/is-submitted").then(
          (res) => res.json(),
        );
        if (isSubmitted) {
          setState({ status: "submitted" });
          return;
        }

        const accounts = await getAccounts(controller.signal);

        if (!controller.signal.aborted) {
          setState({
            status: "success",
            accounts: toAccountViews(accounts, []),
          });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Failed to load accounts",
          });
        }
      }
    }

    void loadAccounts();
    return () => controller.abort();
  }, []);

  // Remove a specific account by id and update state
  async function removeAccount(accountId: number) {
    await deleteAccount(accountId);
    setState((current) => {
      if (current.status !== "success") return current;
      return {
        ...current,
        accounts: current.accounts.filter(
          (account) => account.id !== accountId,
        ),
      };
    });
  }

  async function addProvider(providerId: number) {
    const account = await addAccount(providerId);
    setState((current) => {
      if (current.status !== "success") return current;
      return {
        ...current,
        accounts: toAccountViews([...current.accounts, account], []),
      };
    });
  }

  // Save a statement for a specific account and update state
  async function saveStatement(accountId: number, statement: Statement) {
    const updatedAccount = await uploadStatement(accountId, statement);
    setState((current) => {
      if (current.status !== "success") return current;

      const accounts = current.accounts.map((account) =>
        account.id === updatedAccount.id ? updatedAccount : account,
      );
      const providers = current.accounts.map((account) => ({
        id: account.providerId,
        name: account.providerName,
      }));

      return { ...current, accounts: toAccountViews(accounts, providers) };
    });
  }

  // Submit all accounts for review and processing and update state
  async function submit() {
    if (state.status !== "success" || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitAccounts();
      setState({ status: "submitted" });
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit accounts",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    ...state,
    addProvider,
    removeAccount,
    saveStatement,
    submit,
    isSubmitting,
    submitError,
  };
}

// Fetch function for deleting an account
async function deleteAccount(accountId: number): Promise<void> {
  const response = await fetch(`/api/accounts/${accountId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete account (${response.status})`);
  }
}

// Fetch function for uploading a statement
export async function uploadStatement(
  accountId: number,
  statement: Statement,
): Promise<Account> {
  const response = await fetch(`/api/accounts/${accountId}/statement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(statement),
  });

  if (!response.ok) {
    throw new Error(`Failed to save statement (${response.status})`);
  }

  return response.json();
}

export async function submitAccounts(): Promise<void> {
  const response = await fetch("/api/accounts/submit", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Failed to submit accounts (${response.status})`);
  }
}
