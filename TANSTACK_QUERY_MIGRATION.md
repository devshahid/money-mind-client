# TanStack Query Migration

## Status

TanStack Query is introduced as the server-state cache for ledger detail entries. The ledger detail query is the pilot implementation; Redux and IndexedDB remain responsible for offline state and durable sync operations.

## Completed

- [x] Install `@tanstack/react-query`.
- [x] Register a shared `QueryClientProvider` at the application root.
- [x] Add shared query defaults with a five-minute `staleTime`.
- [x] Use a stable ledger detail query key: `['ledger', ledgerId, 'entries']`.
- [x] Fetch canonical ledger entries when a server-backed ledger is opened.
- [x] Keep Redux/IndexedDB entries as the offline fallback.
- [x] Disable query retries so Axios remains the network retry owner.
- [x] Invalidate the ledger detail query after a successful sync.
- [x] Update component tests with an isolated `QueryClientProvider`.
- [x] Preserve the existing full frontend test suite.

## Migration Rules

- TanStack Query owns server state: fetching, caching, stale time, refetching, and invalidation.
- Redux owns UI state and local mutation state.
- IndexedDB owns the offline cache and durable sync outbox.
- Never replace unsynced local ledger mutations with server data.
- Use feature-specific query-key factories instead of ad hoc string arrays.
- Keep Axios as the single HTTP and retry layer.
- Invalidate or update affected queries after mutations and sync.
- Clear authenticated query data on logout or user change.

## Remaining Work

### Shared Query Infrastructure

- [ ] Add typed query-key factories under each migrated feature.
- [ ] Define a shared query-client test helper.
- [ ] Decide whether TanStack Query persistence is needed beyond the existing IndexedDB domain cache.
- [ ] Add cache clearing when the authenticated user changes.

### Ledger Follow-Up

- [ ] Extract ledger keys into a dedicated `ledgerKeys` module.
- [ ] Add tests for query reuse within the five-minute stale window.
- [ ] Add tests for refetch after the stale window.
- [ ] Add tests for invalidation after link, unlink, delete, and sync operations.
- [ ] Confirm deployed-browser behavior after frontend and backend deployment.

### Feature Migration Order

Migrate one feature at a time, preserving behavior and validating after each feature:

1. [ ] Transactions: list, detail, pagination, filters, and mutations.
2. [ ] Debts: list, detail, create, update, and delete.
3. [ ] Goals: list, detail, progress updates, and delete.
4. [ ] Budgets: current budget, recommendations, and mutations.
5. [ ] Transaction groups: list, detail, sync, and mutations.
6. [ ] Analytics: server-backed reports and date-range queries.
7. [ ] AI features: request state, polling, and cached results where appropriate.

## Per-Feature Checklist

- [ ] Identify server state versus Redux/UI state.
- [ ] Create stable feature query keys.
- [ ] Add query functions around existing service methods.
- [ ] Set an appropriate `staleTime` based on data volatility.
- [ ] Define mutation invalidation or direct cache updates.
- [ ] Preserve offline behavior and existing IndexedDB outbox semantics.
- [ ] Add loading, error, empty, and stale-data behavior.
- [ ] Add focused query-cache tests.
- [ ] Run the feature tests, full frontend tests, TypeScript, and ESLint.
- [ ] Verify the feature in both a fresh browser profile and an existing local cache.

## Validation Gate

Do not remove equivalent Redux or IndexedDB behavior from a feature until:

- Fresh-browser server loading works.
- Offline cached loading works.
- Pending local mutations remain protected.
- Query invalidation is verified after mutations.
- The feature's focused tests and full frontend suite pass.
