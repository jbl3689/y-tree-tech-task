# Y TREE Technical Task Plan

## Required reading for AI assistants

AI assistants must read this plan in full before proceeding with any work in this repository. Also read [the original task instructions](tech-task-v3.html) and the relevant code before making changes. Keep changes simple and within the requested scope.

## Goal

Build a small full-stack onboarding flow where a client can:

- See their current providers/accounts
- See whether each statement is Missing, Uploaded, or Outdated
- Add one or more known providers
- Remove providers
- Upload/replace a statement
- Filter by status
- Submit only when every provider has a current statement

Keep the solution simple, readable, and easy to explain in the follow-up walkthrough.

---

## 1. Project setup

Repo structure:

```text
/
├── client/
├── server/
├── README.md
├── NOTES.md
└── PLAN.md
```

### Client

- React
- TypeScript
- Vite
- Keep dependencies minimal
- Use native `fetch`
- Use Vite proxy for `/api` requests to Spring Boot

### Server

- Java
- Spring Boot
- Maven
- Spring Web only unless something else becomes genuinely useful
- In-memory data only
- No database
- No Docker
- No auth

Confirm both apps start before building features.

---

## 2. Backend models

### Provider

Represents a provider from the known provider list.

Suggested fields:

```java
Long id
String name
```

A Java `record` is fine.

### Account

Represents a provider the client has actually added.

Suggested fields:

```java
Long id
Long providerId
Statement statement
```

You can include the provider name directly if that makes the API simpler.

### Statement

Suggested fields:

```java
String fileName
LocalDate uploadedAt
```

### Status

Use:

```java
MISSING
UPLOADED
OUTDATED
```

Prefer deriving status from the statement rather than storing it separately.

Rules:

- No statement -> `MISSING`
- Statement older than 3 months -> `OUTDATED`
- Otherwise -> `UPLOADED`

---

## 3. Seed data

Create a small known provider list in memory.

Example:

```text
Barclays
HSBC
Lloyds
NatWest
Santander
Vanguard
Fidelity
Hargreaves Lansdown
AJ Bell
Aviva
```

Seed the client with 3–4 accounts that cover all statuses.

Example:

```text
Barclays  -> Uploaded
HSBC      -> Missing
Vanguard  -> Outdated
Fidelity  -> Uploaded
```

---

## 4. Backend structure

Keep the package structure simple:

```text
controller/
  AccountsController
  ProvidersController

service/
  AccountsService
  ProvidersService

model/
  Account
  Provider
  Statement
  AccountStatus
```

Controllers should stay thin.

Business rules should live in services.

---

## 5. API

Suggested endpoints:

```http
GET /api/providers
GET /api/accounts
POST /api/accounts
DELETE /api/accounts/{id}
POST /api/accounts/{id}/statement
POST /api/accounts/submit
```

### `GET /api/providers`

Return all known providers.

Optionally exclude already-added providers here, or do that client-side. Whichever you choose, make the decision intentional.

### `GET /api/accounts`

Return current client accounts and their status.

### `POST /api/accounts`

Add a provider to the client's accounts.

Prevent duplicates.

### `DELETE /api/accounts/{id}`

Remove an account.

### `POST /api/accounts/{id}/statement`

No real file upload required.

Accept something like:

```json
{
  "fileName": "statement.pdf",
  "uploadedAt": "2026-09-09"
}
```

Update the account's statement.

### `POST /api/accounts/submit`

Server must independently validate that every account is `UPLOADED`.

If any are Missing or Outdated:

- reject the request
- return a useful error message

Do not rely only on the frontend disabling the button.

---

## 6. Frontend structure

Keep components small and obvious.

Possible structure:

```text
src/
├── api/
│   └── accounts.ts
├── components/
│   ├── AccountList.tsx
│   ├── AccountRow.tsx
│   ├── StatusBadge.tsx
│   ├── AddProviderDialog.tsx
│   └── ProgressSummary.tsx
├── types/
│   └── index.ts
└── App.tsx
```

Do not add Redux.

Normal React state is enough.

---

## 7. Frontend behaviour

### Initial load

Fetch:

- known providers
- client accounts

Show a loading state.

Show an error if either request fails.

### Account list

For every account show:

- provider name
- current status
- current statement filename if present
- upload or replace action
- remove action

### Filtering

Allow filtering by:

```text
All
Missing
Uploaded
Outdated
```

### Add provider

Allow:

- searching known providers
- choosing several at once
- hiding providers already added

### Upload

Treat upload as:

- filename
- date

No actual file storage.

After upload:

- refresh or update account state
- visibly update readiness

### Submit

Clearly show something like:

```text
3 of 4 ready
```

Disable submit if any account is Missing or Outdated.

When all accounts are ready:

```text
4 of 4 ready
Ready to submit
```

On successful submission, show clear success feedback.

On failed submission, show the backend error clearly.

---

## 8. Tests

Do a few meaningful tests only.

### Backend

Current coverage:

- `GET /api/accounts` returns account IDs, provider IDs, statement details with ISO dates, and missing statements as `null`.
- `GET /api/providers` returns known provider IDs/names, including a provider not yet added to the client's accounts.
- The existing application-context smoke test checks startup.

Run with `cd server && ./mvnw test`. The endpoint tests use MockMvc with real services and the existing test dependencies.

The priority tests below remain to be added when submission validation, backend status calculation, and adding providers are implemented. Status is currently calculated in the frontend; the backend only exposes the two read endpoints.

Highest priority:

- submission fails if any account is Missing
- submission fails if any account is Outdated
- submission succeeds if every account is Uploaded

Also useful:

- statement older than 3 months becomes Outdated
- duplicate provider cannot be added

### Frontend

Pick at least one useful behaviour.

Good options:

- submit button disabled when an account is not ready
- uploading a current statement updates the account status
- status filter shows the correct accounts

Avoid testing trivial markup.

---

## 9. README

Include very short run instructions.

Example:

```text
# Server

cd server
./mvnw spring-boot:run

# Client

cd client
npm install
npm run dev
```

Mention expected ports if useful:

```text
Client: http://localhost:5173
Server: http://localhost:8080
```

---

## 10. NOTES.md

Keep this short.

Include:

### Decisions

- In-memory data instead of a database
- Status derived from statement date
- Server owns submission validation
- Simple React state instead of Redux
- Vite proxy used to avoid unnecessary CORS setup

### Trade-offs

Examples:

- Provider/account data resets when backend restarts
- No real file upload
- Minimal validation
- No persistence layer

### With more time

Examples:

- persistent database
- richer API error model
- accessibility pass
- better upload UX
- stronger test coverage
- e2e submit-flow test

### AI usage

Keep a short record of where AI helped.

Example:

- Maven/Spring setup troubleshooting
- API/design review
- edge-case suggestions
- test-case review

Core architecture and implementation should remain understandable to you.

---

## 11. Suggested build order

Work roughly in this order:

```text
1. Confirm client and server both run
2. Create Provider / Account / Statement models
3. Add provider seed data
4. Add account seed data
5. Build GET /providers
6. Build GET /accounts
7. Render accounts in React
8. Add status calculation
9. Add/remove providers
10. Upload/replace statement
11. Add filtering
12. Add submit endpoint + server-side validation
13. Wire submit UI
14. Add meaningful backend test
15. Add meaningful frontend test
16. Add loading/error/success states
17. Write README + NOTES
18. Final cleanup
```

---

## 12. Keep yourself honest

Before adding anything, ask:

> Does this help satisfy the brief, protect an important rule, or make the code easier to understand?

If not, probably skip it.

The main product question should stay obvious throughout the app:

> **Am I ready to submit?**

Everything else supports that.
