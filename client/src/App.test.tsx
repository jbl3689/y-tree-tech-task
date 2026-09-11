import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import App from "./App";
import type { Account, Statement } from "./types";

const currentStatement: Statement = { fileName: "statement.pdf", uploadedAt: "2026-05-31" };
const readyAccounts: Account[] = [
  { id: 1, providerId: 1, providerName: "Barclays", statement: currentStatement },
  { id: 2, providerId: 2, providerName: "HSBC", statement: currentStatement },
];
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 4, 31, 12));
  fetchMock.mockReset().mockRejectedValue(new Error("Unexpected API request"));
  vi.stubGlobal("fetch", fetchMock);
});

it.each([
  ["missing", null],
  ["outdated", { fileName: "old.pdf", uploadedAt: "2026-02-27" }],
] as const)("blocks submission with a %s statement even when filtering hides it", async (_, statement) => {
  fetchMock.mockResolvedValueOnce(Response.json([
    readyAccounts[0], { ...readyAccounts[1], statement },
  ]));
  const user = userEvent.setup();
  render(<App />);

  await screen.findByRole("heading", { name: "HSBC" });
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();
  await user.selectOptions(screen.getByRole("combobox", { name: "Filter" }), "UPLOADED");

  expect(screen.queryByRole("heading", { name: "HSBC" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Barclays" })).toBeInTheDocument();
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("1 of 2 ready");
  await user.click(screen.getByRole("button", { name: "Submit", exact: true }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.queryByText("Submission complete")).not.toBeInTheDocument();
});

it("updates readiness after upload and waits for submit success before hiding accounts", async () => {
  fetchMock.mockResolvedValueOnce(Response.json([
    readyAccounts[0], { ...readyAccounts[1], statement: null },
  ]));
  let finishUpload!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve) => { finishUpload = resolve; }));
  let finishSubmit!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve) => { finishSubmit = resolve; }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Upload statement for HSBC" }));
  await user.upload(screen.getByLabelText("Statement file"), new File(["statement"], "new.pdf"));
  await user.click(screen.getByRole("button", { name: "Save statement" }));
  expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/accounts/2/statement", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: "new.pdf", uploadedAt: "2026-05-31" }),
  });

  await act(async () => finishUpload(Response.json({
    ...readyAccounts[1], statement: { ...currentStatement, fileName: "new.pdf" },
  })));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("new.pdf")).toBeInTheDocument();
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("2 of 2 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeEnabled();

  await user.click(screen.getByRole("button", { name: "Submit", exact: true }));
  expect(screen.getByRole("button", { name: "Submitting…" })).toBeDisabled();
  expect(screen.getByRole("list", { name: "Your accounts" })).toBeInTheDocument();
  expect(screen.queryByText("Submission complete")).not.toBeInTheDocument();
  await act(async () => finishSubmit(new Response(null, { status: 200 })));
  expect(await screen.findByText("Submission complete")).toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Your accounts" })).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/accounts/submit", { method: "POST" });
});

it("keeps accounts visible after rejected submission and allows a successful retry", async () => {
  fetchMock.mockResolvedValueOnce(Response.json(readyAccounts))
    .mockResolvedValueOnce(new Response(null, { status: 400 }))
    .mockResolvedValueOnce(new Response(null, { status: 200 }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Submit", exact: true }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Failed to submit accounts (400)");
  expect(screen.getByRole("list", { name: "Your accounts" })).toBeInTheDocument();
  expect(screen.queryByText("Submission complete")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeEnabled();

  await user.click(screen.getByRole("button", { name: "Submit", exact: true }));
  expect(await screen.findByText("Submission complete")).toBeInTheDocument();
});

it("adds one provider from the dialog and reloads available providers on reopening", async () => {
  fetchMock.mockResolvedValueOnce(Response.json(readyAccounts))
    .mockResolvedValueOnce(Response.json([{ id: 10, name: "Aviva" }]));
  let finishAdd!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve) => { finishAdd = resolve; }))
    .mockResolvedValueOnce(Response.json([]));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Add provider" }));
  const dialog = screen.getByRole("dialog", { name: "Add a provider" });
  expect(dialog).toHaveAttribute("open");
  expect(within(dialog).getByRole("button", { name: "Add provider" })).toBeDisabled();
  await user.selectOptions(await within(dialog).findByRole("combobox", { name: "Provider" }), "10");
  await user.click(within(dialog).getByRole("button", { name: "Add provider" }));
  expect(within(dialog).getByRole("button", { name: "Adding…" })).toBeDisabled();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId: 10 }),
  });

  await act(async () => finishAdd(Response.json({
    id: 5, providerId: 10, providerName: "Aviva", statement: null,
  })));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Aviva" })).toBeInTheDocument();
  expect(screen.getByText(/of 3 ready/)).toHaveTextContent("2 of 3 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();

  await user.click(screen.getByRole("button", { name: "Add provider" }));
  expect(await screen.findByText("All available providers have already been added.")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Cancel" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Add provider" })).toHaveFocus();
  expect(fetchMock.mock.calls.filter(([url]) => url === "/api/providers")).toHaveLength(2);
});

it.each(["http", "network"])("shows loading then an account-load %s failure", async (failure) => {
  let finishLoad!: (response: Response) => void;
  let rejectLoad!: (reason: Error) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve, reject) => {
    finishLoad = resolve;
    rejectLoad = reject;
  }));
  render(<App />);

  expect(screen.getByRole("status")).toHaveTextContent("Loading accounts");
  expect(screen.queryByRole("button", { name: "Submit", exact: true })).not.toBeInTheDocument();
  await act(async () => {
    if (failure === "http") finishLoad(new Response(null, { status: 503 }));
    else rejectLoad(new Error("Network unavailable"));
  });

  expect(await screen.findByRole("alert")).toHaveTextContent(
    failure === "http" ? "Failed to fetch accounts (503)" : "Network unavailable",
  );
  expect(screen.queryByText("Loading accounts...")).not.toBeInTheDocument();
  expect(screen.queryByRole("list", { name: "Your accounts" })).not.toBeInTheDocument();
});

it("filters every status and restores the full list without changing readiness", async () => {
  fetchMock.mockResolvedValueOnce(Response.json([
    readyAccounts[0],
    { ...readyAccounts[1], statement: null },
    { id: 3, providerId: 3, providerName: "Vanguard", statement: { fileName: "old.pdf", uploadedAt: "2026-02-27" } },
  ]));
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { name: "Vanguard" });

  for (const [filter, names] of [
    ["MISSING", ["HSBC"]],
    ["OUTDATED", ["Vanguard"]],
    ["UPLOADED", ["Barclays"]],
    ["ALL", ["Barclays", "HSBC", "Vanguard"]],
  ] as const) {
    await user.selectOptions(screen.getByRole("combobox", { name: "Filter" }), filter);
    const list = within(screen.getByRole("list", { name: "Your accounts" }));
    expect(list.getAllByRole("heading").map((heading) => heading.textContent)).toEqual(names);
    expect(screen.getByText(/of 3 ready/)).toHaveTextContent("1 of 3 ready");
    expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();
  }
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("keeps a provider after failed removal, then updates readiness when retry succeeds", async () => {
  fetchMock.mockResolvedValueOnce(Response.json([
    readyAccounts[0], { ...readyAccounts[1], statement: null },
  ])).mockResolvedValueOnce(new Response(null, { status: 500 }));
  let finishRemove!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve) => { finishRemove = resolve; }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Remove HSBC" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Failed to delete account (500)");
  expect(screen.getByRole("heading", { name: "HSBC" })).toBeInTheDocument();
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("1 of 2 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();

  await user.click(screen.getByRole("button", { name: "Remove HSBC" }));
  expect(screen.getByRole("button", { name: "Removing HSBC" })).toBeDisabled();
  expect(screen.getByRole("heading", { name: "HSBC" })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenLastCalledWith("/api/accounts/2", { method: "DELETE" });
  await act(async () => finishRemove(new Response(null, { status: 200 })));

  expect(screen.queryByRole("heading", { name: "HSBC" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Barclays" })).toBeInTheDocument();
  expect(screen.getByText(/of 1 ready/)).toHaveTextContent("1 of 1 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeEnabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps an outdated statement after a failed replacement and allows retry", async () => {
  fetchMock.mockResolvedValueOnce(Response.json([
    readyAccounts[0],
    { ...readyAccounts[1], statement: { fileName: "old.pdf", uploadedAt: "2026-02-27" } },
  ])).mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(Response.json({
      ...readyAccounts[1], statement: { ...currentStatement, fileName: "replacement.pdf" },
    }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Replace statement for HSBC" }));
  const dialog = within(screen.getByRole("dialog", { name: "Replace statement" }));
  expect(dialog.getByRole("button", { name: "Save statement" })).toBeDisabled();
  await user.upload(dialog.getByLabelText("Statement file"), new File(["statement"], "replacement.pdf"));
  await user.click(dialog.getByRole("button", { name: "Save statement" }));

  expect(await dialog.findByRole("alert")).toHaveTextContent("Failed to save statement (500)");
  expect(screen.getByText("old.pdf")).toBeInTheDocument();
  expect(within(screen.getByRole("list", { name: "Your accounts" })).getByText("Outdated")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();
  await user.click(dialog.getByRole("button", { name: "Save statement" }));

  expect(await screen.findByText("replacement.pdf")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByText("old.pdf")).not.toBeInTheDocument();
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("2 of 2 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeEnabled();
});

it("shows provider loading and failure without changing existing accounts", async () => {
  fetchMock.mockResolvedValueOnce(Response.json(readyAccounts));
  let finishLoad!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(new Promise((resolve) => { finishLoad = resolve; }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Add provider" }));
  const dialog = within(screen.getByRole("dialog", { name: "Add a provider" }));
  expect(dialog.getByRole("status")).toHaveTextContent("Loading providers");
  expect(dialog.getByRole("button", { name: "Add provider" })).toBeDisabled();
  await act(async () => finishLoad(new Response(null, { status: 503 })));

  expect(await dialog.findByRole("alert")).toHaveTextContent("Failed to fetch providers (503)");
  expect(dialog.getByRole("button", { name: "Add provider" })).toBeDisabled();
  await user.click(dialog.getByRole("button", { name: "Cancel" }));
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("2 of 2 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeEnabled();
});

it("keeps the provider selection after a failed add and allows retry", async () => {
  fetchMock.mockResolvedValueOnce(Response.json(readyAccounts))
    .mockResolvedValueOnce(Response.json([{ id: 10, name: "Aviva" }]))
    .mockResolvedValueOnce(new Response(null, { status: 500 }))
    .mockResolvedValueOnce(Response.json({ id: 5, providerId: 10, providerName: "Aviva", statement: null }));
  const user = userEvent.setup();
  render(<App />);

  await user.click(await screen.findByRole("button", { name: "Add provider" }));
  const dialog = within(screen.getByRole("dialog", { name: "Add a provider" }));
  await user.selectOptions(await dialog.findByRole("combobox", { name: "Provider" }), "10");
  await user.click(dialog.getByRole("button", { name: "Add provider" }));
  expect(await dialog.findByRole("alert")).toHaveTextContent("Failed to add provider (500)");
  expect(dialog.getByRole("combobox", { name: "Provider" })).toHaveValue("10");
  expect(screen.queryByRole("heading", { name: "Aviva" })).not.toBeInTheDocument();
  expect(screen.getByText(/of 2 ready/)).toHaveTextContent("2 of 2 ready");

  await user.click(dialog.getByRole("button", { name: "Add provider" }));
  expect(await screen.findByRole("heading", { name: "Aviva" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText(/of 3 ready/)).toHaveTextContent("2 of 3 ready");
  expect(screen.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();
});
